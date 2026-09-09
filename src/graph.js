/**
 * assay-graph v1 — the interchange format.
 *
 * A description of every style in a codebase and where each value came from.
 * The point of writing it down and versioning it is that the applications
 * (scoring, diffing, blast radius, change sets) are downstream of the artifact,
 * and someone else should be able to write a second extractor against it
 * without asking a question.
 *
 * Two properties matter more than anything else in the shape:
 *
 *   1. PORTABLE. Every path is relative to the analysed root, so a graph built
 *      in CI and a graph built on a laptop compare cleanly.
 *   2. DETERMINISTIC. Keys are sorted and every unit carries a content hash, so
 *      a diff is a hash comparison rather than a deep walk, and an unchanged
 *      codebase produces a byte-identical graph.
 *
 * See GRAPH.md for the full specification.
 */
import { createHash } from 'node:crypto';
import { relative, sep } from 'node:path';

export const GRAPH_VERSION = 1;

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

export function hashOf(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
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

/** A graph's identity, ignoring when it was generated. */
export function graphHash(graph) {
  return hashOf({ tokens: graph.tokens, units: graph.units });
}

/* ------------------------------------------------------------------ *
 * Blast radius
 * ------------------------------------------------------------------ */

/**
 * Which units a set of tokens reaches, following token -> token edges.
 *
 * This is the part that makes the graph worth having. Changing a primitive
 * like `palette.violet500` touches no component directly — it is referenced by
 * `colors.accent`, which is what components actually use. Without the closure
 * you would report a blast radius of zero for the most dangerous change in the
 * system.
 */
export function blastRadius(graph, seedTokens) {
  // token -> tokens that reference it
  const referencedBy = new Map();
  for (const tok of Object.values(graph.tokens)) {
    for (const ref of tok.refs) {
      if (!referencedBy.has(ref)) referencedBy.set(ref, []);
      referencedBy.get(ref).push(tok.id);
    }
  }

  const reached = new Set();
  const queue = [...seedTokens];
  while (queue.length) {
    const t = queue.shift();
    if (reached.has(t)) continue;
    reached.add(t);
    for (const parent of referencedBy.get(t) ?? []) {
      if (!reached.has(parent)) queue.push(parent);
    }
  }

  const units = [];
  for (const unit of Object.values(graph.units)) {
    const via = unit.tokens.filter((t) => reached.has(t));
    if (via.length) units.push({ id: unit.id, file: unit.file, via: via.sort() });
  }

  const files = [...new Set(units.map((u) => u.file))].sort();
  return {
    seeds: [...seedTokens].sort(),
    tokens: [...reached].sort(),
    units: units.sort((a, b) => (a.id < b.id ? -1 : 1)),
    files,
  };
}

/* ------------------------------------------------------------------ *
 * Diff
 * ------------------------------------------------------------------ */

function diffDeclarations(a, b) {
  const key = (d) => `${d.prop}@${d.cond}`;
  const A = new Map(a.map((d) => [key(d), d]));
  const B = new Map(b.map((d) => [key(d), d]));
  const changes = [];

  for (const [k, db] of B) {
    const da = A.get(k);
    if (!da) {
      changes.push({ kind: 'added', decl: db });
      continue;
    }
    const va = da.token ?? da.value ?? da.cat;
    const vb = db.token ?? db.value ?? db.cat;
    if (va !== vb || da.cat !== db.cat) {
      changes.push({ kind: 'changed', from: da, to: db });
    }
  }
  for (const [k, da] of A) if (!B.has(k)) changes.push({ kind: 'removed', decl: da });
  return changes;
}

/**
 * Diff two graphs.
 *
 * `styleChanged` is the set of units whose compiled styles differ — computed
 * from content hashes, so it is exact for styling. It does NOT catch markup or
 * logic changes, which is why M4's change-set narrowing unions it with the
 * units whose source files changed. Stated plainly here so nobody mistakes it
 * for a complete visual diff.
 */
export function diffGraphs(base, head) {
  const unitsA = base.units ?? {};
  const unitsB = head.units ?? {};
  const tokensA = base.tokens ?? {};
  const tokensB = head.tokens ?? {};

  const added = [];
  const removed = [];
  const styleChanged = [];

  for (const id of Object.keys(unitsB)) {
    if (!unitsA[id]) {
      added.push(id);
      continue;
    }
    if (unitsA[id].hash !== unitsB[id].hash) {
      styleChanged.push({
        id,
        file: unitsB[id].file,
        line: unitsB[id].line,
        changes: diffDeclarations(unitsA[id].declarations, unitsB[id].declarations),
      });
    }
  }
  for (const id of Object.keys(unitsA)) if (!unitsB[id]) removed.push(id);

  const tokensAdded = [];
  const tokensRemoved = [];
  const tokensChanged = [];
  for (const id of Object.keys(tokensB)) {
    if (!tokensA[id]) {
      tokensAdded.push(id);
      continue;
    }
    if (
      tokensA[id].value !== tokensB[id].value ||
      tokensA[id].raw !== tokensB[id].raw
    ) {
      tokensChanged.push({ id, from: tokensA[id].value, to: tokensB[id].value });
    }
  }
  for (const id of Object.keys(tokensA)) if (!tokensB[id]) tokensRemoved.push(id);

  const touchedTokens = [...tokensChanged.map((t) => t.id), ...tokensRemoved];
  const radius = blastRadius(
    head,
    touchedTokens.filter((t) => head.tokens[t]),
  );
  // A removed token has no node in `head`, so reach it from the base graph.
  const removedRadius = tokensRemoved.length
    ? blastRadius(base, tokensRemoved)
    : { units: [], files: [], tokens: [], seeds: [] };

  const delta =
    base.summary?.score != null && head.summary?.score != null
      ? head.summary.score - base.summary.score
      : null;

  return {
    version: GRAPH_VERSION,
    summary: {
      unitsAdded: added.length,
      unitsRemoved: removed.length,
      unitsStyleChanged: styleChanged.length,
      tokensAdded: tokensAdded.length,
      tokensRemoved: tokensRemoved.length,
      tokensChanged: tokensChanged.length,
      scoreDelta: delta,
      baseScore: base.summary?.score ?? null,
      headScore: head.summary?.score ?? null,
    },
    units: { added, removed, styleChanged },
    tokens: { added: tokensAdded, removed: tokensRemoved, changed: tokensChanged },
    blastRadius: {
      tokens: [...new Set([...radius.tokens, ...removedRadius.tokens])].sort(),
      units: [...radius.units, ...removedRadius.units],
      files: [...new Set([...radius.files, ...removedRadius.files])].sort(),
    },
  };
}
