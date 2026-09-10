---
id: 12
title: An agent surface over the graph
type: feature
status: backlog
milestone: v1.0
labels:
  - mcp
created: 2026-09-10
updated: 2026-09-10
priority: p1
---

## Problem

An agent editing a design system has no way to ask what tokens exist or whether
a change conforms — so it guesses, and guesses drift.

## Proposal

An MCP server exposing the graph read-only: list tokens, check a proposed
change, blast radius, contrast report.

## Acceptance criteria

- [ ] Read-only: the server never writes to the repository
- [ ] Works against a graph file, not just a live tree
