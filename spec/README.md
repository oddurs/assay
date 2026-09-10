# The stylegraph format

A description of every style in a codebase and where each value came from.

Assay's features — scoring, diffing, blast radius, change sets — are all
downstream of this artifact. It is specified and versioned separately from the
tool on purpose: **the format is the durable thing, and the tool is one
implementation of it.**

```bash
stylegraph graph ./src --out graph.json
stylegraph diff base.json head.json
```

## Design constraints

Two properties matter more than anything else in the shape:

**Portable.** Every path is relative to the analysed root, POSIX-separated. A
graph built in CI and a graph built on a laptop must compare cleanly.

**Deterministic.** Object keys are sorted, declarations within a unit are sorted
by `(prop, cond)`, and every unit carries a content hash. An unchanged codebase
produces a byte-identical graph apart from `generatedAt`, which is excluded from
every hash.

## Top level

```jsonc
{
  "version": 1,
  "generator": { "name": "assay", "version": "0.1.0", "adapter": "stylex" },
  "generatedAt": "2026-09-09T18:22:41.006Z",  // never hashed
  "root": "site/src",
  "summary": { … },
  "tokens": { "<tokenId>": Token },
  "themes": { "<themeId>": Theme },
  "units":  { "<unitId>":  Unit },
  "dead":   ["<tokenId>", …]
}
```

`version` is a single integer. A consumer that does not recognise it must refuse
the file rather than guess — the CLI does exactly this.

## Identifiers

Both id kinds are `"<path>#<name>"`, where `<path>` is relative to `root`.

|             |                                                                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **tokenId** | `tokens/color.stylex.ts#colors.accent` — the file, the exported namespace, then the token name. Nested tokens dot-join: `#nested.surface.bg`. Token names may contain any characters StyleX allows, including CSS custom property names: `#vars.--color-fg`. |
| **unitId**  | `components/Button.tsx#primary` — the file, then the key inside `stylex.create`.                                                                                                                                                                             |

Identity is a **resolved module path**, never a bare namespace name. Two packages
that both export `colors` must not alias into each other. Producers are expected
to resolve relative imports and tsconfig `paths` aliases; a specifier that cannot
be resolved to a file is kept whole (e.g. `@acme/tokens#colors.fg`) so it stays
unique rather than silently colliding.

## Token

```jsonc
{
  "id": "tokens/color.stylex.ts#colors.accent",
  "file": "tokens/color.stylex.ts",
  "name": "colors.accent",
  "value": "#7350F5", // fully resolved, or null if not statically knowable
  "raw": "palette.violet500", // source text of the definition
  "refs": ["tokens/primitives.stylex.ts#palette.violet500"],
}
```

`refs` are **token → token edges** and they are the reason blast radius works.
A primitive like `palette.violet500` is referenced by _no component_ — components
use `colors.accent`, which references the primitive. Without the edge you would
report a blast radius of zero for the most dangerous change in the system.

`value` resolves the whole chain (`semantic → primitive → literal`). A
conditional value resolves to its `default` branch, since that is what renders
absent a media query. Producers that cannot resolve a value must emit `null`
rather than a guess.

## Theme

A theme is a `createTheme` call: a set of alternate values for one var group.

```jsonc
{
  "id": "themes/themes.ts#daylight",
  "file": "themes/themes.ts",
  "name": "daylight",
  "group": "tokens/color.stylex.ts#colors",
  "overrides": {
    "tokens/color.stylex.ts#colors.accent": "#5F3AE8",
    "tokens/color.stylex.ts#colors.bgBase": "#FFFFFF",
  },
}
```

Themes are part of the format because **a token's value is only true under one
of them.** A consumer asking "what does `colors.accent` render as" cannot answer
from `tokens` alone, and re-extracting to find out defeats the point of having a
format.

`overrides` carries resolved values, following the same chain rules as a token's
`value`, with the theme's own overrides taking precedence. A theme that
overrides a group unrelated to a question — corner radii, for a contrast check —
cannot change that question's answer, and a consumer should skip it rather than
report a duplicate result under a misleading name.

## Unit

A **unit** is one styled thing: one key inside one `stylex.create` call.

```jsonc
{
  "id":   "components/Button.tsx#primary",
  "file": "components/Button.tsx",
  "name": "primary",
  "line": 34,
  "declarations": [
    { "prop": "backgroundColor", "cond": "default", "cat": "token",
      "family": "color", "token": "tokens/color.stylex.ts#colors.accent" },
    { "prop": "backgroundColor", "cond": ":hover", "cat": "token",
      "family": "color", "token": "tokens/color.stylex.ts#colors.accentHover" },
    { "prop": "borderRadius", "cond": "default", "cat": "literal",
      "family": "radius", "value": "6px", "rule": "no-raw-radius" }
  ],
  "tokens": ["tokens/color.stylex.ts#colors.accent", …],
  "hash": "3f9a1c02b7e45d18"
}
```

| field    |                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prop`   | The CSS property, camelCased as written.                                                                                                                                                |
| `cond`   | `"default"`, or the condition path joined with `" > "` — `":hover"`, `"@media (max-width: 720px)"`, `"default > :hover"` for nested conditions. `(prop, cond)` is unique within a unit. |
| `cat`    | One of the six outcomes below.                                                                                                                                                          |
| `family` | The token-bearing family, or absent if the property carries no tokens.                                                                                                                  |
| `token`  | Present when `cat` is `token`.                                                                                                                                                          |
| `value`  | Present when `cat` is `literal`.                                                                                                                                                        |
| `rule`   | The rule that a literal violates, present when `cat` is `literal` and a family applies.                                                                                                 |

`tokens` is `declarations` denormalised — every distinct token the unit
references, sorted. It exists so blast radius is a set intersection instead of a
walk.

### Outcomes

| `cat`     |                                                                        |
| --------- | ---------------------------------------------------------------------- |
| `token`   | Resolves to a design token. **The numerator of the score.**            |
| `literal` | A hardcoded design value in a token-bearing family. **The violation.** |
| `dynamic` | Depends on a runtime parameter. Never a pass _or_ a violation.         |
| `neutral` | Keyword, zero, `null`, or layout geometry (`50%`, `calc(…)`).          |
| `cssvar`  | A raw `var(--x)` — a variable, just not a traceable one.               |
| `expr`    | An expression the producer could not resolve.                          |

A producer that cannot classify a value must emit `expr`, never `token` or
`literal`. **Guessing corrupts the score in a way nobody can see**, which is
worse than an honest blind spot.

### `hash`

`sha256` of the sorted `declarations` array, first 16 hex characters.

It covers **what renders, not where it sits**. Moving a block twenty lines down
must not read as a visual change, so `line` and source position are excluded.
Two units with equal hashes have identical compiled styles.

## Diff semantics

A diff compares two graphs of the same `version`.

- A unit is **style-changed** iff its `hash` differs. This is _exact for
  styling_: equal hashes cannot render differently. It does **not** catch markup
  or logic changes, so a visual change set is this unioned with the set of units whose
  source files changed.
- A token is **changed** iff its `value` or `raw` differs.
- **Blast radius** is the transitive closure over `refs` from the changed tokens,
  then every unit whose `tokens` intersects that closure. Removed tokens are
  closed over the _base_ graph, since they have no node in head.

## Writing another producer

Emit the shape above. The rules that actually matter:

1. Resolve module identity to a file path, including tsconfig `paths` aliases.
2. Emit token → token `refs`, or blast radius silently under-reports.
3. Sort declarations by `(prop, cond)` before hashing, or the hash churns on
   source reordering.
4. Never guess a classification. `expr` is always available.
5. Keep `generatedAt` out of every hash.

In Assay itself the producer sits behind `src/adapters/`. An adapter is
`{ name, matches(file, src), analyzeFile(params) }`; the entire rest of the tool
is adapter-agnostic. There is exactly one adapter today — the seam exists so a
second stays possible, not because writing one now would be useful.

## Stability

Within v1: fields may be **added**. Nothing will be removed or repurposed, and
`hash` semantics will not change — a v1 hash computed today must equal one
computed by any other v1 producer on the same declarations. Anything else is a
version bump.
