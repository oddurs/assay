# stylegraph

[![ci](https://github.com/stylegraphjs/stylegraph/actions/workflows/ci.yml/badge.svg)](https://github.com/stylegraphjs/stylegraph/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A specified graph of every style in a codebase, and the tools that read it.**
For [StyleX](https://stylexjs.com).

```sh
npx stylegraph .
```

```
  █████████████████████████████░░░░░  86.3%

     1284  token-resolved
      204  raw literals
     1488  scored declarations

  ✗ contrast AA: 2 of 15 real pairings fail
    Button.tsx:36 primary  2.87:1 needs 4.5  #FFFFFF on #9C87FF
```

> stylegraph is a community project. It is not affiliated with or endorsed by
> Meta, who build StyleX.

## Why this can only exist for StyleX

Every other styling system makes the question uncomputable. Tailwind assembles
class strings at runtime. styled-components interpolates props into template
literals. CSS Modules hands you opaque class references. You cannot statically
answer _"did this padding come from a token"_ in any of them.

StyleX is a compiler. `defineVars` makes tokens real module exports with real
types, and `stylex.create` resolves to atomic classes at build time. **The
shipped design system is a typed, statically resolvable graph** — and that graph
is what everything here reads.

## The shape of it

The format is the product. The tools are what speak it.

```
                      spec  ─── defines the format
                        │
                    extract  ── produces a graph from StyleX source
                        │
        ┌───────────┬───┴───┬──────────┬─────────┐
      audit      tokens   variants    test      mcp
```

| package                                     |                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------- |
| [`@stylegraph/spec`](packages/spec)         | the format: version, validation, hashing, diff, blast radius          |
| [`@stylegraph/extract`](packages/extract)   | StyleX source → `stylegraph.json`. The only StyleX-coupled package    |
| [`@stylegraph/audit`](packages/audit)       | conformance, contrast on real pairings, dead tokens, blast radius     |
| [`@stylegraph/tokens`](packages/tokens)     | DTCG bridge — W3C design tokens to and from `defineVars`              |
| [`@stylegraph/variants`](packages/variants) | compile-time variants                                                 |
| [`@stylegraph/test`](packages/test)         | matchers, a readable serializer for atomic classes, theme-matrix runs |
| [`@stylegraph/mcp`](packages/mcp)           | an agent surface over the graph                                       |

Only `audit` is written today. The rest are scaffolded — the workspace, CI and
release process exist before the code does, on purpose.

**[spec/](spec)** is the format's specification. It is a sibling of `packages/`,
not a file inside one, because no tool owns it: it is written so a second
producer can be built from it without asking a question.

## The site measures itself

[stylegraph.dev](https://stylegraph.dev) is built with StyleX and scored by this
tool on every build, gated at 100%. It consumes the workspace rather than a
published version, so a regression fails the build the moment it is introduced
rather than at the next release.

## Development

```sh
git clone git@github.com:stylegraphjs/stylegraph.git
cd stylegraph
scripts/setup          # dependencies, git hooks, generated report — once
scripts/task check     # everything CI runs
```

All automation talks to the project through one interface, so CI, the git hooks
and you cannot drift:

|                      |                                              |
| -------------------- | -------------------------------------------- |
| `scripts/task fmt`   | format in place                              |
| `scripts/task lint`  | lint; warnings are errors                    |
| `scripts/task test`  | test suite, plus the site's conformance gate |
| `scripts/task build` | build the site                               |
| `scripts/task check` | all of the above                             |

`main` only advances through a merged pull request, and one unit of work gets one
worktree. `scripts/agent` drives that loop — see [CONTRIBUTING.md](CONTRIBUTING.md).

MIT.
