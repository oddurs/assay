/**
 * @stylegraph/audit — judging a stylegraph.
 *
 * `extract` produces the graph and resolves token values. This package decides
 * whether what it found is acceptable: conformance, contrast on the pairings
 * that actually render, dead tokens, and what a change reaches.
 *
 * The split matters. Producing a graph is a fact; judging it is an opinion, and
 * opinions belong where they can be argued with and configured.
 */
import { analyze, makeResolver } from '@stylegraph/extract';
import { analyzeContrast } from './contrast.js';

const NO_CONTRAST = (level) => ({
  level,
  checked: 0,
  failing: [],
  results: [],
  unpaired: 0,
});

/**
 * Analyse a tree and judge it.
 *
 * Contrast runs once per THEME, not once. Resolving tokens to their base values
 * only ever checks the default theme — which reported three of four themes on
 * our own site as passing when they had AA failures. A checker that returns a
 * false pass is worse than no checker.
 */
export async function audit(root, opts = {}) {
  const result = await analyze(root, opts);
  const cfg = result.config;

  if (!cfg.contrast.enabled) {
    result.contrast = NO_CONTRAST(cfg.contrast.level);
    result.contrastByTheme = [];
    return result;
  }

  const level = cfg.contrast.level;
  const base = analyzeContrast(result.pairs, makeResolver(result.rawTokens), { level });
  base.theme = null;

  // Only a theme that overrides a token some pairing actually uses can change a
  // verdict. A theme of corner radii cannot fail a contrast check, and running
  // it would just repeat the base result under a misleading name.
  const inPairs = new Set();
  for (const pair of result.pairs.values()) {
    for (const slot of Object.values(pair.byCond ?? {})) {
      for (const prop of ['color', 'backgroundColor']) {
        const t = slot?.[prop]?.token;
        if (t) inPairs.add(t);
      }
    }
  }

  const byTheme = [];
  for (const theme of result.themes.values()) {
    const touches = [...theme.overrides.keys()].some((id) => inPairs.has(id));
    if (!touches) continue;
    const resolve = makeResolver(result.rawTokens, theme.overrides);
    const run = analyzeContrast(result.pairs, resolve, { level });
    run.theme = theme.name;
    if (run.checked > 0) byTheme.push(run);
  }

  result.contrast = base;
  result.contrastByTheme = byTheme;
  // The gate must consider every theme, not just the default one.
  result.contrastFailing = [
    ...base.failing.map((f) => ({ ...f, theme: null })),
    ...byTheme.flatMap((r) => r.failing.map((f) => ({ ...f, theme: r.theme }))),
  ];

  return result;
}

export { analyzeContrast, parseColor, ratio, luminance, flatten } from './contrast.js';
export * from './report.js';
export { analyze } from '@stylegraph/extract';
