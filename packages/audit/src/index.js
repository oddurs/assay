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

/** Analyse a tree and judge it. Returns the analysis with contrast attached. */
export async function audit(root, opts = {}) {
  const result = await analyze(root, opts);
  const cfg = result.config;
  const resolve = makeResolver(result.rawTokens);

  result.contrast = cfg.contrast.enabled
    ? analyzeContrast(result.pairs, resolve, { level: cfg.contrast.level })
    : NO_CONTRAST(cfg.contrast.level);

  return result;
}

export { analyzeContrast, parseColor, ratio, luminance, flatten } from './contrast.js';
export * from './report.js';
export { analyze } from '@stylegraph/extract';
