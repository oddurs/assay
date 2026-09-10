---
id: 11
title: Run a suite under every theme
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

Themes are where design systems break, and nothing tests them. Our own site
shipped three themes with AA failures.

## Proposal

`forEachTheme` wraps a suite and runs it once per theme in the graph.
