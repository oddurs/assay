/**
 * Assay — compile-time design system conformance for StyleX.
 *
 *   import { analyze } from 'assay';
 *   const result = await analyze('./src');
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname, resolve as resolvePath } from 'node:path';
import { stylexAdapter } from './adapters/stylex.js';
import { buildFamilies, CAT, CAT_DOC, FAMILIES } from './taxonomy.js';
import { loadConfig, matcher, ownerOf } from './config.js';
import { makeResolver } from './values.js';

const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

function collect(dir, cfg, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    if (cfg.skipDirs.includes(name)) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
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
  const adapter = opts.adapter ?? stylexAdapter;
  const families = buildFamilies(cfg.disableFamilies);
  const isExcluded = matcher(cfg.exclude);
  const isAllowed = matcher(cfg.allow);

  const out = {
    files: 0,
    callSites: 0,
    tokenDefSites: 0,
    excludedFiles: 0,
    declarations: 0,
    untokenizable: 0,
    byCat: {},
    byFamily: {},
    violations: [],
    unparsed: [],
    tokens: new Map(),
    referenced: new Set(),
    pairs: new Map(),
    units: new Map(),
    themes: new Map(),
    byFile: new Map(),
  };

  // Absolute, so module identity matches between definitions and references.
  const absRoot = resolvePath(root);

  for (const abs of collect(absRoot, cfg)) {
    const rel = relative(absRoot, abs);
    if (isExcluded(rel)) {
      out.excludedFiles += 1;
      continue;
    }
    const src = readFileSync(abs, 'utf8');
    if (!adapter.matches(rel, src)) continue;
    out.files += 1;
    adapter.analyzeFile({
      file: rel,
      absFile: abs,
      src,
      families,
      out,
      aliases: cfg.aliases ?? {},
    });
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

  // An allow-listed file leaves the score ENTIRELY — both its tokens and its
  // literals. Dropping only the literals would let a team raise their number by
  // allow-listing their best files, which is exactly how a metric becomes a
  // vanity metric.
  let allowedToken = 0;
  let allowedLiteral = 0;
  const allowedFamilies = {};
  for (const [file, counts] of out.byFile) {
    if (!isAllowed(file)) continue;
    allowedToken += counts.token;
    allowedLiteral += counts.literal;
    for (const [fam, c] of Object.entries(counts.families)) {
      allowedFamilies[fam] = allowedFamilies[fam] || { token: 0, literal: 0 };
      allowedFamilies[fam].token += c.token;
      allowedFamilies[fam].literal += c.literal;
    }
  }

  const token = Math.max(0, (out.byCat[CAT.TOKEN] || 0) - allowedToken);
  const literal = Math.max(0, (out.byCat[CAT.LITERAL] || 0) - allowedLiteral);
  const scored = token + literal;
  const score = scored === 0 ? null : token / scored;

  // Dead tokens are meaningless for a package that publishes tokens for
  // consumers — the consumers are not in this tree.
  const dead = cfg.publishesTokens
    ? []
    : [...out.tokens.keys()].filter((id) => !out.referenced.has(id));

  const resolve = makeResolver(out.tokens);

  const familyRows = Object.entries(out.byFamily)
    .map(([name, v]) => {
      const off = allowedFamilies[name] ?? { token: 0, literal: 0 };
      const tok = Math.max(0, v.token - off.token);
      const lit = Math.max(0, v.literal - off.literal);
      const total = tok + lit;
      return {
        name,
        token: tok,
        literal: lit,
        total,
        score: total === 0 ? 1 : tok / total,
        rule: FAMILIES.find((f) => f.id === name)?.rule ?? null,
      };
    })
    .filter((f) => f.total > 0)
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
    absRoot,
    adapter: adapter.name,
    units: out.units,
    rawTokens: out.tokens,
    themes: out.themes,
    // Each theme's overrides, resolved — the graph carries values, not ASTs.
    themeValues: Object.fromEntries(
      [...out.themes.values()].flatMap((t) => {
        const r = makeResolver(out.tokens, t.overrides);
        return [...t.overrides.keys()].map((id) => [id, r(id)]);
      }),
    ),
    config: cfg,
    score,
    token,
    literal,
    scored,
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
    pairs: out.pairs,
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
export { loadConfig, DEFAULTS, globToRegExp, matcher, ownerOf } from './config.js';
export { buildGraph } from './build.js';
export { makeResolver } from './values.js';
// Re-exported for convenience so a consumer needs one import, not two.
export { GRAPH_VERSION, validateGraph } from '@stylegraph/spec';
