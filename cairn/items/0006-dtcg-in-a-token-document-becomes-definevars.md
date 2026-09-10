---
id: 6
title: 'DTCG in: a token document becomes defineVars'
type: feature
status: done
milestone: v0.2
labels:
  - tokens
created: 2026-09-10
updated: 2026-09-10
priority: p0
---

## Problem

Half a bridge is not a bridge. Designers change tokens in Figma; that has to
land in code without hand-copying hex values.

## Proposal

`fromDTCG(doc)` generates `*.stylex.ts` sources — one file per group, aliases
as real module references so the generated code has the same shape a human
would write.

## Acceptance criteria

- [ ] Generated files compile and pass the audit at 100%
- [ ] Aliases become imports, not inlined values
- [ ] Regenerating with no upstream change produces a byte-identical file
