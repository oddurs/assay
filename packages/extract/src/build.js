/**
 * The producer: an analysis result becomes a portable, deterministic graph.
 *
 * This lives in `extract` rather than `spec` deliberately — the spec defines
 * what a graph IS, and a producer is one of possibly several things that make
 * one. Putting the only producer inside the spec would make the claim that
 * anyone can write another producer into a fiction.
 */
import { relative, sep } from 'node:path';
import { GRAPH_VERSION, hashOf } from '@stylegraph/spec';

const toPosix = (p) => p.split(sep).join('/');

/** Rewrite an absolute-path token id to one relative to the root. */
function portableId(id, absRoot) {
  const hash = id.indexOf('#');
  if (hash === -1) return id;
  const file = id.slice(0, hash);
  const rest = id.slice(hash);
  if (!file.startsWith('/') && !/^[A-Za-z]:\\/.test(file)) return toPosix(file) + rest;
  const rel = relative(absRoot, file);
  // Outside the tree (a bare package, say): keep it whole so it stays unique.
  return (rel.startsWith('..') ? toPosix(file) : toPosix(rel)) + rest;
}

function sortObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}

/**
 * Build a portable, deterministic graph from an analysis result.
 * `generatedAt` is deliberately NOT part of any hash.
 */
export function buildGraph(result, opts = {}) {
  const absRoot = result.absRoot ?? result.root;
  const pid = (id) => portableId(id, absRoot);

  const tokens = {};
  for (const [id, tok] of result.rawTokens) {
    const key = pid(id);
    tokens[key] = {
      id: key,
      file: toPosix(tok.file),
      name: tok.name,
      value: result.tokens.values[id] ?? null,
      raw: tok.raw ?? null,
      refs: (tok.refs ?? []).map(pid).sort(),
    };
  }

  const units = {};
  for (const [id, unit] of result.units) {
    const key = toPosix(id);
    const declarations = unit.declarations
      .map((d) => {
        const out = { prop: d.prop, cond: d.cond, cat: d.cat };
        if (d.family) out.family = d.family;
        if (d.token) out.token = pid(d.token);
        if (d.value !== undefined) out.value = d.value;
        if (d.rule) out.rule = d.rule;
        return out;
      })
      // Sorted so declaration order in source does not churn the hash.
      .sort((a, b) =>
        a.prop === b.prop ? (a.cond < b.cond ? -1 : 1) : a.prop < b.prop ? -1 : 1,
      );

    units[key] = {
      id: key,
      file: toPosix(unit.file),
      name: unit.name,
      line: unit.line,
      declarations,
      tokens: unit.tokens.map(pid).sort(),
      // The hash covers what RENDERS, not where it sits in the file: moving a
      // block down 20 lines must not read as a visual change.
      hash: hashOf(declarations),
    };
  }

  const dead = (result.tokens.dead ?? []).map(pid).sort();

  return {
    version: GRAPH_VERSION,
    generator: {
      name: 'assay',
      version: opts.version ?? '0.1.0',
      adapter: opts.adapter ?? 'stylex',
    },
    generatedAt: new Date().toISOString(),
    root: toPosix(relative(process.cwd(), absRoot) || '.'),
    summary: {
      score: result.score,
      token: result.token,
      literal: result.literal,
      scored: result.scored,
      excluded: result.excluded,
      files: result.stats.files,
      units: Object.keys(units).length,
      tokens: Object.keys(tokens).length,
      dead: dead.length,
      contrastFailing: result.contrast?.failing?.length ?? 0,
    },
    tokens: sortObject(tokens),
    units: sortObject(units),
    dead,
  };
}
