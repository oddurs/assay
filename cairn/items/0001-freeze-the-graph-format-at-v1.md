---
id: 1
title: Freeze the graph format at v1
type: feature
status: backlog
milestone: v0.1
labels:
  - spec
created: 2026-09-10
updated: 2026-09-10
priority: p0
---

## Problem

spec/README.md describes the format but nothing enforces it. A second producer
could emit something subtly wrong and no one would know until a consumer broke.

## Proposal

Ship `validateGraph` with real coverage: every required field, id shape,
declaration shape, hash agreement. Add a conformance fixture — a known-good
graph the validator must accept and mutated copies it must reject.

## Acceptance criteria

- [ ] A mutated field is rejected with a message naming it
- [ ] Two independent producers agree on `hash` for identical declarations
- [ ] The fixture lives in packages/spec so any producer can run it
