# assay

**Compile-time design system conformance for StyleX.** Tells you what your design
system actually shipped — not what the spec says it should have.

```bash
npx assay .
```

```
  █████████████████████████████░░░░░  86.3%

     1284  token-resolved
      204  raw literals
     1488  scored declarations

  excluded from the score
        7  dynamic — runtime value, unknowable by design
      312  keyword, zero, or layout geometry
     1160  non-token property — display, position, …

  by family
  color    ████████████████░░   89%  298/334
  space    ░░░░░░░░░░░░░░░░░░    1%  2/219
  type     ░░░░░░░░░░░░░░░░░░    0%  0/121

  ✗ contrast AA: 2 of 15 real pairings fail
    Button.tsx:36 primary  2.87:1 needs 4.5  #FFFFFF on #9C87FF
```

## Why this can only exist for StyleX

Every other styling system makes the question uncomputable. Tailwind assembles
class strings at runtime. styled-components interpolates props into template
literals. CSS Modules hands you opaque class references. You cannot statically
answer *"did this padding come from a token"* in any of them.

StyleX is a compiler. `defineVars` makes tokens real module exports with real
types, and `stylex.create` resolves to atomic classes at build time. **The shipped
design system is a typed, statically resolvable graph** — and that graph is what
Assay reads.

## Commands

```bash
assay [path]                  score a tree
assay tokens [path]           inventory, resolved values, dead tokens
assay contrast [path]         contrast on pairings that actually occur
assay graph [path]            emit assay-graph.json v1
assay diff <base> <head>      what changed, and what it reaches
assay impact <token…> [path]  blast radius of changing a token
assay rules                   the taxonomy: every rule and why it exists
assay explain                 how the score is defined, and what it excludes
```

### Diff and blast radius

`base` and `head` may each be a path on disk, a git ref, or a previously
emitted graph file.

```bash
assay diff main HEAD
assay diff base.json head.json --out diff.json
assay diff HEAD ./src --path src        # ref vs working tree, same subdirectory
```

```
  conformance  100.0% → 100.0%   no change

  tokens
  ~ colors.accent        #7350F5 → #3D8BFF
  ~ palette.violet500    #7350F5 → #3D8BFF

  blast radius
  7 units across 7 files reference the changed tokens
    components/Button.tsx#primary   colors.accent
    components/Glow.tsx#a           colors.gradientVia
    …

  styles changed  1 unit
  components/Card.tsx#root:10
      ~ padding: space.roomy → space.loose
```

Blast radius follows **token → token edges**, which is the whole point. A
primitive like `palette.violet500` is referenced by *no component* — components
use `colors.accent`, which references the primitive. Without the transitive
closure you would report a blast radius of zero for the most dangerous change in
the system.

Style changes are computed from per-unit content hashes, so they are **exact for
styling** and ignore code movement — shifting a block twenty lines down is not a
change. They do not catch markup or logic changes; a visual change set is this
unioned with the units whose source files changed.

Git refs are materialised with `git archive` into a temp directory: read-only,
and it cannot disturb uncommitted work.

## The graph format

Everything above is an application built on one artifact: a versioned JSON
description of every style in the codebase and where each value came from.

**[GRAPH.md](./GRAPH.md) is the specification.** It is written so a second
producer can be built from it without asking a question — the format is the
durable thing, and this tool is one implementation of it.

Inside Assay the producer sits behind `src/adapters/`. An adapter is
`{ name, matches(file, src), analyzeFile(params) }` and the rest of the tool is
adapter-agnostic. There is one adapter today; the seam exists so a second stays
possible, not because writing one now would be useful.

| Option | |
|---|---|
| `--json` | machine-readable output |
| `--violations` | every violation, with the rule that fired |
| `--exclude <glob>` | skip paths (repeatable) |
| `--gate [n]` | exit 1 below n percent (default 100) |
| `--contrast-level AA\|AAA` | default AA |
| `--no-contrast` | skip contrast analysis |
| `--publishes-tokens` | this package exports tokens for consumers |

Exit codes: `0` passed · `1` below gate · `2` contrast failures under `--gate`.

## The taxonomy

**The denominator is not every declaration.** `display: 'flex'` cannot carry a
design token, so counting it as a violation would make the score meaningless.
A property is scored only if it belongs to a token-bearing family:

| Family | Rule | Properties |
|---|---|---|
| color | `no-raw-color` | `*Color`, `fill`, `stroke`, … |
| space | `no-raw-space` | `padding*`, `margin*`, `gap`, `inset*`, … |
| radius | `no-raw-radius` | `*Radius` |
| border | `no-raw-border-width` | `border*Width`, `outline*Width`, … |
| type | `no-raw-type` | `fontSize`, `fontFamily`, `fontWeight`, … |
| shadow | `no-raw-shadow` | `boxShadow`, `textShadow` |
| motion | `no-raw-motion` | `transitionDuration`, `*TimingFunction`, … |
| layer | `no-raw-z-index` | `zIndex` |

Every declaration lands in one of five outcomes, and **only two move the number**:

| | |
|---|---|
| `token` | Resolves to a `*.stylex` module export. **The numerator.** |
| `literal` | A hardcoded design value in a scored family. **The violation.** |
| `dynamic` | Runtime value → CSS custom property. Never a pass *or* a violation. |
| `neutral` | Keyword, zero, `null`, or layout geometry (`50%`, `calc()`). |
| `cssvar` / `expr` | A raw `var(--x)`, or an expression we could not resolve. |

`dynamic` is the important one. It is genuinely unknowable at compile time, and
it gets its own count on every report. **A metric that hides its blind spot is
worse than no metric.**

Token *definitions* are never violations. The literals inside `defineVars` and
`defineConsts` are the design system.

Run `assay rules` for the full table with the reasoning for each rule.

## Contrast, on real pairings

Not every theoretical combination in the palette — only the foreground and
background **declared together in the same style rule**, which are the ones that
actually render. Assay resolves both through the token chain
(`semantic.fg → palette.ink900 → '#E4E9F1'`), composites any alpha, and applies
the WCAG large-text threshold when a co-declared `fontSize`/`fontWeight` earns it.

The honest limit: a component whose background comes from a parent cannot be
resolved statically. Those are reported as `unpaired` — never as passes.

## Config

`assay.config.json`, `assay.config.js`, or `.assayrc.json` in the analyzed root.

```jsonc
{
  "exclude": ["generated", "**/*.gen.ts"],
  "allow": ["src/legacy/**"],        // still reported, kept out of the score
  "disableFamilies": ["motion"],
  "threshold": 0.95,                  // gate without passing --gate
  "publishesTokens": false,           // true disables dead-token analysis
  "contrast": { "level": "AA", "enabled": true },
  "aliases": { "@/*": ["./src/*"] },  // tsconfig paths are auto-detected
  "owners": {
    "@acme/growth": ["src/features/billing/**"],
    "@acme/core": ["src/components/**"]
  }
}
```

With `owners` set, violations roll up per team — which is the number a design
system lead actually needs.

## Programmatic

```js
import { analyze } from 'assay';

const r = await analyze('./src');
console.log(r.score, r.violations, r.contrast.failing, r.tokens.dead);
```

## Known limits

- **Dead-token analysis only makes sense inside an application.** Run against a
  package that *publishes* tokens for consumers and it reports nearly all of them
  dead, because the consumers are not in the tree. Use `--publishes-tokens`.
- **One generated file can dominate a score.** A synthetic benchmark fixture once
  produced 98.4% of a repo's declarations. Assay warns when any single file
  exceeds 20% of violations; put such files in `exclude`.
- **`fontWeight: 'bold'` and `lineHeight: 1.6` are scored as violations.** Design
  systems generally do tokenize these, but it is arguable. Disable the `type`
  family if you disagree.
- **Conditional values resolve to their `default` branch** for contrast. A colour
  that only appears under a media query is not separately checked.
- One level of tsconfig `extends` is followed, not a deep chain.

## Development

```bash
npm test        # 66 assertions, including the original hand count
npm run assay   # run the CLI from source
```

The scoring tests are the original hand count from the first spike — every number
was counted by hand from `test/fixtures`, with the per-declaration reasoning
written into the fixture comments. They are the regression net for every refactor
since.

MIT.
