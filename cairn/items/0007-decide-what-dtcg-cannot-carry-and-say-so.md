---
id: 7
title: Decide what DTCG cannot carry, and say so
type: docs
status: done
milestone: v0.2
labels:
  - tokens
created: 2026-09-10
updated: 2026-09-10
priority: p1
---

## Problem

The formats do not overlap perfectly. StyleX conditional values (media queries,
:hover) have no clean DTCG equivalent, and DTCG has types StyleX has no use for.

Guessing a mapping silently is the same failure as guessing a classification.

## Acceptance criteria

- [ ] Every lossy case is enumerated in the README
- [ ] The bridge warns on a lossy conversion rather than dropping it quietly
