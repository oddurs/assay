/**
 * The StyleX adapter.
 *
 * Everything StyleX-specific lives behind this interface. Nothing above it —
 * scoring, the graph, diffing, blast radius, contrast — knows what a
 * `stylex.create` call looks like.
 *
 * An adapter is:
 *
 *   name        string, recorded in the graph's `generator.adapter`
 *   matches     (file, src) => boolean   cheap pre-filter before parsing
 *   analyzeFile ({ file, absFile, src, families, out, aliases }) => void
 *
 * `analyzeFile` populates the shared `out` accumulator:
 *
 *   out.units       Map<unitId, { id, file, name, line, declarations[], tokens[] }>
 *   out.tokens      Map<tokenId, { id, file, name, value(AST), raw, refs[] }>
 *   out.referenced  Set<tokenId>
 *   out.pairs       Map<key, { file, rule, line, color?, backgroundColor?, … }>
 *   out.violations  Array<{ file, line, prop, family, rule, value, … }>
 *   plus the counters: declarations, untokenizable, byCat, byFamily, callSites
 *
 * A second extractor (Panda CSS, vanilla-extract) is a second module shaped
 * like this one. It is deliberately not written — the seam exists so it stays
 * possible, not because it is speculative work worth doing now.
 */
import { analyzeFile } from '../extract.js';

export const stylexAdapter = {
  name: 'stylex',
  // Parsing every file in a monorepo to discover it has no styles is the
  // single most expensive thing this tool could do. A substring check first.
  matches: (_file, src) => src.includes('stylex'),
  analyzeFile,
};

export default stylexAdapter;
