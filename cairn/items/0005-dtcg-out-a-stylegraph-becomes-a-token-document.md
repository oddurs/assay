---
id: 5
title: 'DTCG out: a stylegraph becomes a token document'
type: feature
status: done
milestone: v0.2
assignee: Oddur Sigurdsson
labels:
  - tokens
created: 2026-09-10
updated: 2026-09-10
priority: p0
---

## Problem

The W3C DTCG format went stable in October 2025 and Figma, Sketch, Penpot,
Tokens Studio, Style Dictionary and Terrazzo all read it. StyleX speaks none of
it, so a team choosing StyleX chooses to hand-maintain their token pipeline.
That is a real reason teams reject it.

## Proposal

`toDTCG(graph)` emits a DTCG document from defineVars: groups, $type, $value,
and aliases preserved as aliases rather than flattened.

## Acceptance criteria

- [ ] Output validates against the DTCG 2025.10 schema
- [ ] A semantic token referencing a primitive stays an alias, not a copy
- [ ] Round-trips through Style Dictionary without a translation layer
