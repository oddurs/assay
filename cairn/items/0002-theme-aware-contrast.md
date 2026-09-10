---
id: 2
title: Theme-aware contrast
type: bug
status: backlog
milestone: v0.1
labels:
  - audit
created: 2026-09-10
updated: 2026-09-10
priority: p0
---

## Problem

Contrast resolves tokens to their BASE values, so only the default theme is ever
checked. Proven on our own site: three of four themes had AA failures the tool
reported as passing. A checker that reports a false pass is worse than none.

## Proposal

Resolve each `createTheme` override set as an alternate value map and run the
existing pairing analysis once per theme.

## Acceptance criteria

- [ ] Every theme is checked, not just the base
- [ ] Output says which theme a failure is in
- [ ] A fixture with a theme-only failure fails the gate
