---
id: 8
title: Variants that the graph can see
type: feature
status: doing
milestone: v0.3
assignee: Oddur Sigurdsson
labels:
  - variants
created: 2026-09-10
updated: 2026-09-10
priority: p0
---

## Problem

Every design system needs size/tone/state APIs. StyleX has no CVA equivalent, so
teams hand-roll conditional style arrays — which the analyser reads as ordinary
declarations, losing the fact that they are one component's variants.

## Proposal

A compile-time `defineVariants` producing a typed API, emitted so extract can
record variant structure in the graph.

## Acceptance criteria

- [ ] Typed: an unknown variant value is a type error
- [ ] Zero runtime dependencies and a size budget in scripts/task check
- [ ] The graph records which unit a variant belongs to
