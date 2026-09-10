---
id: 10
title: A snapshot serializer a human can review
type: feature
status: backlog
milestone: v0.3
labels:
  - test
created: 2026-09-10
updated: 2026-09-10
priority: p1
---

## Problem

Atomic class names make snapshot diffs unreadable, which makes snapshot tests
worthless for catching style regressions.

## Proposal

A serializer that renders atomic classes back into the declarations they encode.
