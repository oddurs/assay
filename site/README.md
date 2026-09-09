# assay-site

The marketing site for Assay, built with StyleX and measured by Assay on every build.

```
npm run dev      # report + dev server
npm run build    # report + production build
npm run check    # report + fail below the conformance gate
```

## The point

`scripts/assay-report.mjs` runs the real Assay (`../assay.mjs`) over `src/` and writes
`src/generated/report.json`, which the page imports and renders. **No number on the site
is typed in.** Hardcode a hex tomorrow and the homepage score drops on the next deploy.

`npm run check` runs the same analysis with a **100% gate**. CI refuses the merge below it.

## Stack

| | | |
|---|---|---|
| Vite 7 | build | Static site, no server needs. StyleX integration is one unplugin line, and the whole build is verifiable end to end in under a second. Next.js would add a compile model with more moving parts and nothing this site uses. |
| React 19 | UI | Pinned to `19.2.8` — `react-dom@19.3.0` shipped stable before `react@19.3.0` did, so the caret ranges don't resolve. |
| StyleX 0.19 | styling | `@stylexjs/unplugin`, atomic CSS, `createTheme` for the four themes. |
| TypeScript | types | `strict`, `verbatimModuleSyntax`, `resolveJsonModule` for the report import. |

## The four layers

Strictly one-directional. Each layer may reference only the one above it.

```
src/tokens/primitives.stylex.ts   L1  defineConsts — raw scales, inlined, NOT themeable
                                      ↓  the only file where a literal is legal
src/tokens/*.stylex.ts            L2  defineVars — semantic ROLES, never hues
                                      ↓
src/themes/themes.ts              L3  createTheme — a complete re-skin per object
                                      ↓
src/components, src/sections      L4  tokens only; zero literals, enforced in CI
```

**Why L1 is `defineConsts` and L2 is `defineVars`.** Constants are inlined at compile time
and cost nothing at runtime; variables become CSS custom properties, which is what makes
them themeable. Scales don't need to change per theme — meanings do. Putting the ramp in
constants and the roles in variables is what lets `daylight` invert the entire site from
one object without touching a component.

## What the score excludes, and why

`display: flex` cannot carry a token, so it is never scored — only eight token-bearing
property families are. Dynamic styles (the meter sets its own width from a prop, which
StyleX compiles to a CSS custom property) are reported in their own category and counted
as neither a pass nor a violation. A metric that hides its blind spot is worse than none.

## Themes

`midnight` (default), `ember`, `aurora`, `daylight`. The light theme is the load-bearing
demo: it exists to prove L2 never committed to a colour.
