# @stylegraph/tokens

W3C Design Tokens (DTCG) to and from StyleX `defineVars`.

```sh
stylegraph dtcg ./src --out tokens.json      # StyleX → DTCG
stylegraph dtcg --from tokens.json --out src # DTCG → StyleX
```

The [DTCG format](https://www.designtokens.org/tr/2025.10/) reached its first
stable version in October 2025, and Figma, Sketch, Penpot, Tokens Studio, Style
Dictionary and Terrazzo all read it. StyleX speaks none of it — so a team
choosing StyleX today is choosing to hand-maintain their token pipeline.

## Two things this gets right

**Colours are objects, not strings.** 2025.10 takes
`{ colorSpace, components, alpha?, hex? }` with sRGB components in 0–1. Emitting
`"#7350F5"` produces a document that looks correct and validates nowhere; it is
the most common mistake in implementations of this format.

**An alias stays an alias.** A semantic token that points at a primitive is the
design system's structure. Flattening `colors.accent` to a hex value throws that
away, and the receiving tool then shows forty unrelated colours instead of a ramp
and the roles that reference it.

```jsonc
"palette": { "violet500": { "$type": "color", "$value": {
  "colorSpace": "srgb", "components": [0.451, 0.3137, 0.9608], "hex": "#7350f5" } } },
"colors":  { "accent": { "$value": "{palette.violet500}" } }
```

Coming back the other way, that alias becomes an **import**, not an inlined
value — so regenerating does not quietly destroy the structure:

```ts
import { palette } from './palette.stylex';

export const colors = stylex.defineVars({
  accent: palette.violet500,
});
```

Regenerating with no upstream change produces byte-identical files.

## What DTCG cannot carry

The formats do not overlap perfectly. Every lossy conversion is **reported**,
never dropped quietly — guessing a mapping is the same failure as guessing a
classification.

| StyleX                                             | Why it does not cross                                                                                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `boxShadow: '0 1px 2px #000'`                      | DTCG `shadow` is a composite type with named parts; a flat CSS string cannot be split into them without guessing                                   |
| Conditional values — `{ default: …, ':hover': … }` | DTCG has no concept of a token whose value depends on state                                                                                        |
| `linear`, `none`, `transparent`                    | Keywords, not values of any DTCG type                                                                                                              |
| Values built from other values at build time       | Resolved to `null` by the producer, so there is nothing to encode                                                                                  |
| Non-sRGB colour spaces, inbound                    | Converting Oklch to sRGB silently would change the colour somebody chose. The `hex` fallback is used when present, otherwise the token is reported |

Going the other way, composite DTCG types (`border`, `transition`, `typography`,
`gradient`) have no single StyleX token to become and are reported the same way.

Part of [stylegraph](https://github.com/stylegraphjs/stylegraph) — a specified
graph of every style in a codebase, and the tools that read it.

MIT.
