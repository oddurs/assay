---
id: 16
title: Make starting work one command
type: chore
status: done
milestone: v0.1
labels:
  - tooling
created: 2026-09-10
updated: 2026-09-10
priority: p0
---

## Problem

`scripts/agent start` creates a branch and a worktree and stops. Every worktree
so far has then needed the same three manual steps before any work could begin:
`npm install`, `git config core.hooksPath .githooks`, and generating the site's
report. Forgetting the hooks silently disables every guard we built.

Claiming a cairn item also has to happen inside the worktree, or it dirties the
main checkout — which it did, and blocked a pull.

## Proposal

`scripts/agent start --item <id>` derives the branch name and type from the
cairn item, creates the worktree, installs, wires the hooks, generates the
report, and claims the item — inside the worktree.

Carry the item id in the branch name (`fix/0002-slug`) so `pr` and `done` can
find it with no state file.

## Acceptance criteria

- [ ] A fresh worktree is ready to work in with no follow-up commands
- [ ] `doctor` repairs the hooks path instead of only reporting it
- [ ] `done` closes the item
- [ ] `stylegraph .` works from the repo root
