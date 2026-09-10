---
id: 2
title: Theme-aware contrast
type: bug
status: done
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

## 2026-09-10

Themes are captured during extraction and carried in the graph with resolved values, so other packages do not have to re-extract to know them.

Contrast now runs once per theme. Two design decisions worth keeping:

A theme that overrides no colour used by any pairing is skipped rather than run — otherwise a theme of corner radii reports a full set of duplicate results under a misleading name.

The gate counts failures across every theme, not just the base. Reporting only the base is exactly how three of four themes on this site passed while carrying AA failures.

Added test/theme-fixtures with a theme-only failure so this cannot regress: base passes at 18.88:1, the washed theme fails at 1.92:1.
