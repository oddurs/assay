---
id: 18
title: The site becomes a family, not one product
type: feature
status: done
milestone: v0.1
assignee: Oddur Sigurdsson
labels:
  - site
created: 2026-09-10
updated: 2026-09-10
priority: p0
---

## Problem

The site is a single page about one tool. stylegraph is a family now — a format
and six packages — and there is nowhere to send someone who wants to know what
`@stylegraph/tokens` is, or which packages exist at all.

## Proposal

Multi-page, not a router: real files at real paths, which GitHub Pages serves
without a 404 fallback and which each get their own bundle.

- `/` the family: the format, and the tools that read it
- `/<package>/` one page per package, generated from data rather than written
  seven times

The project list is data. Whether a package is written yet is derived at build
time from the source, not typed into a page — the same rule the score follows.

## Acceptance criteria

- [ ] Every package has a page, generated from one component
- [ ] Status on each page is derived, not asserted
- [ ] Works under the Pages base path, not just at the domain root
- [ ] The site still scores 100%
