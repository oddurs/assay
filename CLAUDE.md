# Instructions for agents working in this repository

## Workflow

`main` only advances through a merged pull request. Never commit to it.

One unit of work → one worktree → one branch → one PR. Parallel agents must not
share a checkout.

```sh
cairn next                           # what is ready to work on
scripts/agent start --item <id>      # branch named from the item; the worktree
                                     # arrives installed, hooked and claimed
cd <the path it prints>              # it will not cd for you
scripts/agent check                  # everything CI runs
scripts/agent commit "<message>"
scripts/agent pr
scripts/agent done                   # only after the PR is merged; closes the item
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

stylegraph reads the style graph the StyleX compiler produces and reports what a
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

<!-- cairn:begin -->

## Roadmap and issues

This project tracks its roadmap and issues with `cairn`. Every item is a Markdown file under `cairn/items`, described by the schema in `cairn.toml`.

**Do not create ad-hoc TODO, PLAN or NOTES files.** Create a cairn item instead, so the work appears on the board and in the generated roadmap.

### The loop

1. `cairn next` — what is ready to start. It excludes anything blocked by unfinished dependencies and puts work already in progress first.
2. `cairn claim <ID>` — take it before you start, so no one duplicates the work. `cairn claim --next` picks and claims the top-ranked unclaimed item in one step, and prints its body so you can begin immediately.
3. Do the work. Record what you learn: `cairn set <ID> <field>=<value>` for fields, `cairn note <ID> "<TEXT>"` for anything that needs a sentence — why you chose something, what you tried, what to watch for.
4. `cairn close <ID>` when it is done, or `cairn release <ID>` to hand it back.
5. `cairn check` before you report finished. It must pass.

### Commands

```sh
cairn next --json                 # ready work, ranked
cairn claim --next                # take the next ready item
cairn search <TEXT> --json        # titles, bodies and labels
cairn list --json                 # all open items
cairn list --filter 'blocked=false,priority=p0'
cairn show <ID> --json            # one item, including its body
cairn new "<TITLE>" --type <TYPE> --milestone <MILESTONE>
cairn set <ID> status=<STATUS>    # also labels+=x, or any field below
cairn note <ID> "<TEXT>"          # append reasoning; never replaces
cairn close <ID>
cairn check                       # validate; run before finishing
cairn render                      # regenerate ROADMAP.md
```

### Schema

- **Types**: `feature`, `bug`, `chore`, `docs`
- **Statuses**: `backlog` (open), `planned` (open), `doing` (active), `blocked` (active), `done` (done), `dropped` (dropped)
- **`priority`**: one of p0, p1, p2, p3 — p0 is a release blocker
- **`effort`**: one of s, m, l, xl — Rough size, not an estimate
- **`area`**: free text — Subsystem this touches
- **Milestones**: `v0.1` (due 2026-10-15), `v0.2` (due 2026-12-01), `v0.3` (due 2027-02-01), `v1.0` (due 2027-04-01), `later`

### Rules

1. Before starting work, find or create the item and set it to an active status.
2. Use the fields above rather than inventing new ones; add new fields to `cairn.toml` first.
3. Never hand-edit the generated roadmap file — change items and run `cairn render`.
4. `cairn check` must pass before the work is considered done.

<!-- cairn:end -->
