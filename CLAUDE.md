# Instructions for agents working in this repository

## Workflow

`main` only advances through a merged pull request. Never commit to it.

One unit of work → one worktree → one branch → one PR. Parallel agents must not
share a checkout.

```sh
scripts/agent doctor                 # verify the environment first
scripts/agent start <type>/<slug>    # branch + worktree from origin/main
cd ../.worktrees/assay/<type>/<slug> # the script prints this path; it will not cd for you
scripts/agent check                  # everything CI runs
scripts/agent commit "<message>"
scripts/agent pr
scripts/agent done                   # only after the PR is merged
```

Branch names must match
`^(feat|fix|chore|docs|perf|refactor|test)/[a-z0-9][a-z0-9._-]*$`.

## The stack seam

Never call `npm`, `vite`, `eslint`, or `prettier` directly in automation. Every
build and test goes through `scripts/task`:

```
scripts/task fmt | fmt:check | lint | test | build | check
```

If you need a new capability, add a target to `scripts/task` rather than
teaching CI or a hook about the toolchain.

## Commits

Conventional Commits, enforced by `.githooks/commit-msg`:
`type(scope)!: subject`, subject ≤ 72 characters, no trailing period.

Never pass `--no-verify`. Never use `continue-on-error` or `|| true` to make
something pass.

## Attribution

Do not add AI or assistant attribution anywhere — not in commits, trailers, PR
bodies, code comments, docs, changelogs, or release notes. No co-author trailer
naming a model, no "generated with" footer, no robot emoji. The `commit-msg`
hook rejects these, and the release workflow strips them from generated notes.

## What this project is

Assay reads the style graph the StyleX compiler produces and reports what a
codebase actually shipped: token conformance, dead tokens, contrast on real
pairings, and a versioned graph that diffing and blast radius are built on.

Two invariants matter more than anything else:

1. **Never guess a classification.** A value that cannot be resolved is `expr`,
   never `token` or `literal`.
2. **Never fold `dynamic` into pass or fail.** Runtime values are genuinely
   unknowable at build time and are reported in their own category. A metric
   that hides its blind spot is worse than no metric.

The site in `site/` is measured by the tool on every build and gated at 100%.
If you add a style there, it must come from a design token; `scripts/task test`
fails otherwise. Raw literals are legal in exactly one file:
`site/src/tokens/primitives.stylex.ts`.

`GRAPH.md` specifies the interchange format. It is versioned separately from the
tool — changing its shape is a version bump, not an edit.
