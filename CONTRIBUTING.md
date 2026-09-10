# Contributing

Thanks for looking. This project is small and opinionated; the workflow below is
enforced by hooks and by branch protection, not by etiquette.

## Setup

```sh
git clone git@github.com:stylegraphjs/stylegraph.git
cd stylegraph
scripts/setup
```

`scripts/setup` installs dependencies and points git at the tracked hooks in
`.githooks/`. Run it once.

## The loop

`main` only ever advances through a merged pull request. One unit of work gets
one worktree, one branch, and one PR — so two people (or two agents) never share
a checkout.

```sh
scripts/agent doctor                    # is this machine ready
scripts/agent start feat/blast-radius   # branch + worktree from origin/main
cd ../.worktrees/stylegraph/feat/blast-radius

# ... work ...

scripts/agent check                     # everything CI runs
scripts/agent commit "feat: add blast radius to the PR comment"
scripts/agent pr                        # check, push, open the PR
# ... after it merges ...
scripts/agent done                      # remove worktree and branches
```

`scripts/agent list` shows every worktree and the state of its PR.

## Checks

Everything goes through one interface, so CI, the hooks and you cannot drift:

```sh
scripts/task fmt        # format in place
scripts/task fmt:check  # verify formatting
scripts/task lint       # lint; warnings are errors
scripts/task test       # test suite + the site's conformance gate
scripts/task build      # build the site
scripts/task check      # all of the above
```

`scripts/task check` must pass before a PR. `pre-push` runs it for you.

Never use `--no-verify`. If a hook is wrong, fix the hook.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), enforced
by `.githooks/commit-msg`:

```
type(scope)!: subject
```

Types: `feat` `fix` `chore` `docs` `perf` `refactor` `test` `build` `ci` `style`
`revert`. Subject is at most 72 characters and does not end with a period.

Do not add assistant or AI attribution to commits, PRs, or code — no co-author
trailers naming a model, no "generated with" footers. The hook rejects them.

## Review

This is currently a solo repository, so branch protection requires **0
approvals** — otherwise the only maintainer would be deadlocked. Everything else
still applies: the PR is required, the `required` status check must pass, the
branch must be up to date, and conversations must be resolved. If the project
gains maintainers, raise the approval count to 1.

## Changing the analyser

Two rules, both load-bearing:

1. **Never guess a classification.** If a value cannot be resolved, it is `expr`
   — never `token` or `literal`. A wrong classification corrupts the score in a
   way nobody can see, which is worse than an honest blind spot.
2. **New behaviour needs a fixture.** `test/*-fixtures/` hold small, hand-checked
   inputs; the scoring assertions in `test/run.mjs` are the original hand count
   from the first prototype and are the regression net for every refactor.

If you change the taxonomy in `src/taxonomy.js`, say why in the rule's `why`
field — it is printed by `stylegraph rules` and is the argument a user will judge the
score by.
