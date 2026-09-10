---
id: 9
title: Matchers that assert on tokens, not class names
type: feature
status: doing
milestone: v0.3
assignee: Oddur Sigurdsson
labels:
  - test
created: 2026-09-10
updated: 2026-09-10
priority: p0
---

## Problem

A StyleX snapshot is a list of atomic class names. `x1e2nbdu` tells a reviewer
nothing, so style assertions are either skipped or written against generated
names that churn on every compile.

## Proposal

`expect(el).toUseToken('colors.accent')` and `toHaveTokenStyle({padding: space.md})`,
resolving through the graph so the assertion is semantic.

## Acceptance criteria

- [ ] A failure message names the token that was expected and what was found
- [ ] Works in vitest and jest
