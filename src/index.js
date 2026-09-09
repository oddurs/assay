/**
 * Assay — compile-time design system conformance for StyleX.
 *
 *   import { analyze } from 'assay';
 *   const result = await analyze('./src');
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname, resolve as resolvePath } from 'node:path';
import { analyzeFile } from './extract.js';
import { buildFamilies, CAT, CAT_DOC, FAMILIES } from './taxonomy.js';
import { loadConfig, matcher, ownerOf } from './config.js';
import { analyzeContrast, makeResolver } from './contrast.js';

const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

function collect(dir, cfg, acc = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return acc; }
  for (const name of entries) {
    if (cfg.skipDirs.includes(name)) continue;
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) collect(full, cfg, acc);
    else if (EXTS.has(extname(name))) {
      if (cfg.skipTests && /\.(test|spec)\./.test(name)) continue;
      acc.push(full);
    }
  }
  return acc;
}

export async function analyze(root, opts = {}) {
  const cfg = opts.config ?? (await loadConfig(root, opts.overrides ?? {}));
  const families = buildFamilies(cfg.disableFamilies);
  const isExcluded = matcher(cfg.exclude);
  const isAllowed = matcher(cfg.allow);

  const out = {
    files: 0, callSites: 0, tokenDefSites: 0, excludedFiles: 0,
    declarations: 0, untokenizable: 0,
    byCat: {}, byFamily: {},
    violations: [], unparsed: [],
    tokens: new Map(), referenced: new Set(), pairs: new Map(),
  };

  // Absolute, so module identity matches between definitions and references.
  const absRoot = resolvePath(root);

  for (const abs of collect(absRoot, cfg)) {
    const rel = relative(absRoot, abs);
    if (isExcluded(rel)) { out.excludedFiles += 1; continue; }
    const src = readFileSync(abs, 'utf8');
    if (!src.includes('stylex')) continue;
    out.files += 1;
    analyzeFile({ file: rel, absFile: abs, src, families, out, aliases: cfg.aliases ?? {} });
  }

  // Allow-listed paths stay visible in the result, just out of the score.
  const suppressed = [];
  const violations = [];
  for (const v of out.violations) {
    if (isAllowed(v.file)) suppressed.push(v);
    else violations.push({ ...v, owner: ownerOf(v.file, cfg.owners) });
  }
  const suppressedByFamily = {};
  for (const v of suppressed) {
    suppressedByFamily[v.family] = (suppressedByFamily[v.family] || 0) + 1;
  }

  const token = out.byCat[CAT.TOKEN] || 0;
  const literal = Math.max(0, (out.byCat[CAT.LITERAL] || 0) - suppressed.length);
  const scored = token + literal;
  const score = scored === 0 ? null : token / scored;

  // Dead tokens are meaningless for a package that publishes tokens for
  // consumers — the consumers are not in this tree.
  const dead = cfg.publishesTokens
    ? []
    : [...out.tokens.keys()].filter((id) => !out.referenced.has(id));

  const resolve = makeResolver(out.tokens);
  const contrast = cfg.contrast.enabled
    ? analyzeContrast(out.pairs, resolve, { level: cfg.contrast.level })
    : { level: cfg.contrast.level, checked: 0, failing: [], results: [], unpaired: 0 };

  const familyRows = Object.entries(out.byFamily)
    .map(([name, v]) => {
      const lit = Math.max(0, v.literal - (suppressedByFamily[name] || 0));
      const total = v.token + lit;
      return {
        name,
        token: v.token,
        literal: lit,
        total,
        score: total === 0 ? 1 : v.token / total,
        rule: FAMILIES.find((f) => f.id === name)?.rule ?? null,
      };
    })
    .sort((a, b) => b.total - a.total);

  const byOwner = {};
  if (Object.keys(cfg.owners).length) {
    for (const v of violations) {
      const k = v.owner ?? 'unowned';
      byOwner[k] = (byOwner[k] || 0) + 1;
    }
  }

  const byRule = {};
  for (const v of violations) byRule[v.rule] = (byRule[v.rule] || 0) + 1;

  return {
    root,
    config: cfg,
    score, token, literal, scored,
    excluded: {
      dynamic: out.byCat[CAT.DYNAMIC] || 0,
      neutral: out.byCat[CAT.NEUTRAL] || 0,
      cssvar: out.byCat[CAT.CSSVAR] || 0,
      expr: out.byCat[CAT.EXPR] || 0,
      untokenizable: out.untokenizable,
    },
    families: familyRows,
    violations,
    suppressed,
    byOwner,
    byRule,
    contrast,
    tokens: {
      defined: [...out.tokens.keys()],
      referenced: [...out.referenced],
      dead,
      values: Object.fromEntries([...out.tokens.keys()].map((id) => [id, resolve(id)])),
    },
    stats: {
      files: out.files,
      callSites: out.callSites,
      declarations: out.declarations,
      excludedFiles: out.excludedFiles,
      unparsed: out.unparsed,
    },
    docs: CAT_DOC,
  };
}

export { FAMILIES, CAT, CAT_DOC } from './taxonomy.js';
export { loadConfig, DEFAULTS } from './config.js';
export { parseColor, ratio } from './contrast.js';
