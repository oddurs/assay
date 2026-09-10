/**
 * The extractor. Walks stylex.create / defineVars / defineConsts / createTheme
 * call sites and emits, per file, every style declaration with its provenance.
 *
 * Token references are resolved to a MODULE PATH, not a bare namespace name —
 * so two packages that both export `colors` don't alias into each other.
 */
import { resolveModule } from './resolve.js';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { CAT, NEUTRAL_VALUES, GEOMETRY, ZERO, familyOf } from './taxonomy.js';

const traverse = _traverse.default ?? _traverse;

const TOKEN_MODULE = /\.stylex(\.[cm]?[jt]sx?)?$/;
const STYLE_APIS = new Set(['create', 'keyframes']);
const DEFINE_APIS = new Set([
  'defineVars',
  'defineConsts',
  'unstable_defineVarsNested',
  'unstable_defineConstsNested',
]);
const THEME_APIS = new Set(['createTheme', 'unstable_createThemeNested']);
const VARIANT_API = 'defineVariants';
const VARIANT_PACKAGE = '@stylegraph/variants';

const isStylexPkg = (s) => s === '@stylexjs/stylex' || s.startsWith('@stylexjs/');

export function parseFile(src) {
  const common = {
    sourceType: 'module',
    errorRecovery: true,
    plugins: ['jsx', 'classProperties', 'decorators-legacy'],
  };
  try {
    return parse(src, { ...common, plugins: [...common.plugins, 'typescript'] });
  } catch {
    return parse(src, { ...common, plugins: [...common.plugins, 'flow'] });
  }
}

/* ------------------------------------------------------------------ *
 * Member helpers
 * ------------------------------------------------------------------ */

function memberRoot(node) {
  let cur = node;
  while (cur.type === 'MemberExpression') cur = cur.object;
  return cur.type === 'Identifier' ? cur.name : null;
}

function memberParts(node) {
  const parts = [];
  let cur = node;
  while (cur.type === 'MemberExpression') {
    // Bracket access with a string key is a real pattern: StyleX allows
    // arbitrary token names, and CSS custom property names (`--color-fg`)
    // can only be read as vars['--color-fg'].
    if (cur.computed) {
      if (cur.property.type !== 'StringLiteral') return null;
      parts.unshift(cur.property.value);
    } else {
      if (cur.property.type !== 'Identifier') return null;
      parts.unshift(cur.property.name);
    }
    cur = cur.object;
  }
  if (cur.type !== 'Identifier') return null;
  parts.unshift(cur.name);
  return parts;
}

function usesParam(node, params) {
  let found = false;
  const walk = (n) => {
    if (!n || typeof n !== 'object' || found) return;
    if (n.type === 'Identifier' && params.has(n.name)) {
      found = true;
      return;
    }
    for (const k of Object.keys(n)) {
      if (k === 'loc' || k === 'type') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v.type === 'string') walk(v);
    }
  };
  walk(node);
  return found;
}

/* ------------------------------------------------------------------ *
 * Object shape helpers
 * ------------------------------------------------------------------ */

export const isConditionalKey = (k) =>
  k === 'default' || k.startsWith(':') || k.startsWith('@') || k.startsWith('[');

export function propName(prop) {
  const k = prop.key;
  if (!prop.computed && k.type === 'Identifier') return k.name;
  if (k.type === 'StringLiteral') return k.value;
  return null;
}

/* ------------------------------------------------------------------ *
 * Per-file analysis
 * ------------------------------------------------------------------ */

export function analyzeFile({ file, absFile, src, families, out, aliases = {} }) {
  const modId = absFile ?? file;
  let ast;
  try {
    ast = parseFile(src);
  } catch (e) {
    out.unparsed.push({ file, error: String(e.message).split('\n')[0] });
    return;
  }

  const stylexNames = new Set();
  const bareApis = new Map();
  /** Local name bound to @stylegraph/variants' defineVariants. */
  let variantsLocal = null;
  /** local name -> { module, exportName } */
  const tokenImports = new Map();

  traverse(ast, {
    ImportDeclaration(path) {
      const spec = path.node.source.value;
      const fromTokens = TOKEN_MODULE.test(spec);
      const mod = fromTokens ? resolveModule(modId, spec, aliases) : null;
      for (const s of path.node.specifiers) {
        if (
          s.type === 'ImportNamespaceSpecifier' ||
          s.type === 'ImportDefaultSpecifier'
        ) {
          if (isStylexPkg(spec)) stylexNames.add(s.local.name);
          else if (fromTokens)
            tokenImports.set(s.local.name, { module: mod, exportName: '*' });
        } else if (s.type === 'ImportSpecifier') {
          const imported = s.imported.name ?? s.imported.value;
          if (isStylexPkg(spec)) bareApis.set(s.local.name, imported);
          else if (spec === VARIANT_PACKAGE && imported === VARIANT_API) {
            // Tracked by its local name, because it can be renamed on import.
            variantsLocal = s.local.name;
          } else if (fromTokens)
            tokenImports.set(s.local.name, { module: mod, exportName: imported });
        }
      }
    },
  });

  const apiOf = (callee) => {
    if (
      callee.type === 'MemberExpression' &&
      callee.object.type === 'Identifier' &&
      stylexNames.has(callee.object.name) &&
      callee.property.type === 'Identifier'
    )
      return callee.property.name;
    if (callee.type === 'Identifier' && bareApis.has(callee.name))
      return bareApis.get(callee.name);
    return null;
  };

  // Pass 2: token namespaces declared in THIS file (define + use in one place).
  traverse(ast, {
    VariableDeclarator(path) {
      const init = path.node.init;
      if (!init || init.type !== 'CallExpression') return;
      const api = apiOf(init.callee);
      if (api && DEFINE_APIS.has(api) && path.node.id.type === 'Identifier') {
        tokenImports.set(path.node.id.name, {
          module: modId,
          exportName: path.node.id.name,
        });
      }
    },
  });

  /** A reference like `colors.accent` -> "<module>#colors.accent" */
  const tokenIdOf = (node) => {
    const parts = memberParts(node);
    if (!parts) return null;
    const binding = tokenImports.get(parts[0]);
    if (!binding) return null;
    const rest = parts.slice(1);
    if (binding.exportName === '*') {
      // import * as t from './x.stylex'  ->  t.colors.accent
      if (rest.length < 2) return null;
      return `${binding.module}#${rest.join('.')}`;
    }
    return `${binding.module}#${binding.exportName}${rest.length ? '.' + rest.join('.') : ''}`;
  };

  const ctx = { file, modId, src, tokenImports, tokenIdOf, params: new Set(), out };

  traverse(ast, {
    CallExpression(path) {
      // Checked BEFORE the stylex-api guard below: defineVariants is not a
      // StyleX API, so anything after `if (!api) return` never sees it.
      if (
        variantsLocal &&
        path.node.callee.type === 'Identifier' &&
        path.node.callee.name === variantsLocal
      ) {
        collectVariants(path, ctx);
        return;
      }

      const api = apiOf(path.node.callee);
      if (!api) return;
      const arg = path.node.arguments[0];

      if (STYLE_APIS.has(api)) {
        if (!arg || arg.type !== 'ObjectExpression') return;
        out.callSites += 1;
        for (const p of arg.properties) {
          if (p.type !== 'ObjectProperty') continue;
          const ruleName = propName(p) ?? '?';
          if (p.value.type === 'ObjectExpression') {
            walkStyle(p.value, ctx, families, null, ruleName, {});
          } else if (
            p.value.type === 'ArrowFunctionExpression' ||
            p.value.type === 'FunctionExpression'
          ) {
            const params = new Set();
            for (const par of p.value.params)
              if (par.type === 'Identifier') params.add(par.name);
            if (p.value.body.type === 'ObjectExpression') {
              walkStyle(p.value.body, { ...ctx, params }, families, null, ruleName, {});
            }
          }
        }
        return;
      }

      if (THEME_APIS.has(api)) {
        for (const a of path.node.arguments) recordRefs(a, ctx);
        // A theme's overrides are the only place alternate token values exist.
        // Discarding them is why contrast could only ever see the base theme.
        collectTheme(path, ctx);
        return;
      }

      if (DEFINE_APIS.has(api)) {
        if (!arg || arg.type !== 'ObjectExpression') return;
        recordRefs(arg, ctx);
        const ns = declaredName(path);
        collectTokenDefs(arg, '', `${modId}#${ns ?? '?'}`, ctx);
        out.tokenDefSites += 1;
      }
    },
  });
}

function declaredName(path) {
  let p = path.parentPath;
  while (p) {
    if (p.node.type === 'VariableDeclarator' && p.node.id.type === 'Identifier') {
      return p.node.id.name;
    }
    p = p.parentPath;
  }
  return null;
}

/**
 * A theme: which var group it overrides, and with what.
 *
 * `createTheme(colors, { accent: palette.violet600 })` means every consumer of
 * `colors.accent` renders a different value under this theme. Nothing that
 * judges a value can be correct without knowing that.
 */
function collectTheme(path, ctx) {
  const [target, overrides] = path.node.arguments;
  if (!overrides || overrides.type !== 'ObjectExpression') return;

  const name = declaredName(path);
  const id = `${ctx.modId}#${name ?? '?'}`;
  // Which var group is being themed, so overrides resolve to real token ids.
  const groupId = target ? ctx.tokenIdOf(target) : null;

  // Collected into a local map: an override is an alternate value for an
  // existing token, not a new token definition.
  const local = new Map();
  collectTokenDefs(overrides, '', groupId ?? `${ctx.modId}#?`, {
    ...ctx,
    out: { ...ctx.out, tokens: local },
  });

  ctx.out.themes.set(id, {
    id,
    file: ctx.file,
    name: name ?? '(anonymous)',
    group: groupId,
    overrides: local,
  });
}

/** The axes and values of one `defineVariants` call. */
function collectVariants(path, ctx) {
  const [config] = path.node.arguments;
  if (!config || config.type !== 'ObjectExpression') return;

  const name = declaredName(path) ?? '(anonymous)';
  const axes = {};

  for (const prop of config.properties) {
    if (prop.type !== 'ObjectProperty' || propName(prop) !== 'variants') continue;
    if (prop.value.type !== 'ObjectExpression') continue;

    for (const axis of prop.value.properties) {
      if (axis.type !== 'ObjectProperty') continue;
      const axisName = propName(axis);
      if (!axisName || axis.value.type !== 'ObjectExpression') continue;

      axes[axisName] = axis.value.properties
        .filter((v) => v.type === 'ObjectProperty')
        .map((v) => propName(v))
        .filter(Boolean);
    }
  }

  if (Object.keys(axes).length === 0) return;
  ctx.out.variants.set(`${ctx.file}#${name}`, {
    id: `${ctx.file}#${name}`,
    file: ctx.file,
    name,
    axes,
  });
}

/** Token definitions, flattened. A conditional object is a leaf value. */
function collectTokenDefs(obj, prefix, nsId, ctx) {
  for (const p of obj.properties) {
    if (p.type !== 'ObjectProperty') continue;
    const key = propName(p);
    if (!key) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (p.value.type === 'ObjectExpression') {
      const keys = p.value.properties
        .filter((q) => q.type === 'ObjectProperty')
        .map((q) => propName(q));
      const isLeaf = keys.some((k) => k === null || isConditionalKey(k));
      if (!isLeaf) {
        collectTokenDefs(p.value, path, nsId, ctx);
        continue;
      }
    }
    const refs = [];
    collectRefIds(p.value, ctx, refs);
    ctx.out.tokens.set(`${nsId}.${path}`, {
      id: `${nsId}.${path}`,
      file: ctx.file,
      name: path,
      value: p.value,
      raw: snippet(p.value, ctx.src),
      refs,
      src: ctx.src,
      // Bound to THIS file's imports, so a semantic token can resolve the
      // primitive it points at even though that lives in another module.
      resolveRef: ctx.tokenIdOf,
    });
  }
}

/** Token ids referenced inside a node, for token -> token edges. */
function collectRefIds(node, ctx, acc) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'MemberExpression') {
    const id = ctx.tokenIdOf(node);
    if (id && !acc.includes(id)) acc.push(id);
    return;
  }
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'type') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((n) => collectRefIds(n, ctx, acc));
    else if (v && typeof v.type === 'string') collectRefIds(v, ctx, acc);
  }
}

/** Record token references without scoring — defineVars / createTheme bodies. */
function recordRefs(node, ctx) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'MemberExpression') {
    const id = ctx.tokenIdOf(node);
    if (id) ctx.out.referenced.add(id);
    return;
  }
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'type') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((n) => recordRefs(n, ctx));
    else if (v && typeof v.type === 'string') recordRefs(v, ctx);
  }
}

/* ------------------------------------------------------------------ *
 * Value classification
 * ------------------------------------------------------------------ */

export function classify(node, ctx) {
  if (!node) return { cat: CAT.NEUTRAL };

  switch (node.type) {
    case 'NullLiteral':
      return { cat: CAT.NEUTRAL };

    case 'StringLiteral': {
      const v = node.value.trim();
      if (NEUTRAL_VALUES.has(v)) return { cat: CAT.NEUTRAL };
      if (ZERO.test(v)) return { cat: CAT.NEUTRAL };
      if (GEOMETRY.test(v)) return { cat: CAT.NEUTRAL };
      if (/var\(\s*--/.test(v)) return { cat: CAT.CSSVAR };
      return { cat: CAT.LITERAL, value: v };
    }

    case 'NumericLiteral':
      return node.value === 0
        ? { cat: CAT.NEUTRAL }
        : { cat: CAT.LITERAL, value: String(node.value) };

    case 'TemplateLiteral': {
      if (node.expressions.length === 0) {
        const v = node.quasis
          .map((q) => q.value.cooked)
          .join('')
          .trim();
        if (NEUTRAL_VALUES.has(v)) return { cat: CAT.NEUTRAL };
        if (ZERO.test(v)) return { cat: CAT.NEUTRAL };
        if (GEOMETRY.test(v)) return { cat: CAT.NEUTRAL };
        if (/var\(\s*--/.test(v)) return { cat: CAT.CSSVAR };
        return { cat: CAT.LITERAL, value: v };
      }
      const all = node.expressions.map((e) => classify(e, ctx));
      return all.every((r) => r.cat === CAT.TOKEN)
        ? { cat: CAT.TOKEN, token: all[0].token }
        : { cat: CAT.EXPR };
    }

    case 'Identifier':
      if (node.name === 'undefined') return { cat: CAT.NEUTRAL };
      if (ctx.params.has(node.name)) return { cat: CAT.DYNAMIC };
      return { cat: CAT.EXPR };

    case 'MemberExpression': {
      const id = ctx.tokenIdOf(node);
      if (id) {
        ctx.out.referenced.add(id);
        return { cat: CAT.TOKEN, token: id };
      }
      const root = memberRoot(node);
      if (root && ctx.params.has(root)) return { cat: CAT.DYNAMIC };
      return { cat: CAT.EXPR };
    }

    case 'ConditionalExpression': {
      const a = classify(node.consequent, ctx);
      const b = classify(node.alternate, ctx);
      if (a.cat === CAT.DYNAMIC || b.cat === CAT.DYNAMIC) return { cat: CAT.DYNAMIC };
      if (a.cat === CAT.LITERAL) return a;
      if (b.cat === CAT.LITERAL) return b;
      if (a.cat === CAT.TOKEN && b.cat === CAT.TOKEN) return a;
      return { cat: CAT.EXPR };
    }

    case 'CallExpression':
    case 'BinaryExpression':
      return usesParam(node, ctx.params) ? { cat: CAT.DYNAMIC } : { cat: CAT.EXPR };

    default:
      return { cat: CAT.EXPR };
  }
}

/* ------------------------------------------------------------------ *
 * Declaration walking
 * ------------------------------------------------------------------ */

function walkStyle(obj, ctx, families, prop, ruleName, pairAcc, cond = []) {
  for (const p of obj.properties) {
    if (p.type !== 'ObjectProperty') continue;
    const name = propName(p);
    // At the top of a style object every key is a property. Once inside a
    // property's value, every key is a condition — `:hover`, `@media …`,
    // `default` — and conditions can nest.
    const inCondition = Boolean(prop);
    const nextProp =
      inCondition && (name === null || isConditionalKey(name)) ? prop : name;
    if (!nextProp) continue;
    const nextCond = inCondition && name !== null ? [...cond, name] : cond;

    const val = p.value;

    if (val.type === 'ObjectExpression') {
      walkStyle(val, ctx, families, nextProp, ruleName, pairAcc, nextCond);
      continue;
    }
    if (val.type === 'ArrowFunctionExpression' || val.type === 'FunctionExpression') {
      const params = new Set(ctx.params);
      for (const par of val.params) if (par.type === 'Identifier') params.add(par.name);
      const sub = { ...ctx, params };
      if (val.body.type === 'ObjectExpression') {
        walkStyle(val.body, sub, families, nextProp, ruleName, pairAcc, nextCond);
      } else {
        record(nextProp, val.body, sub, families, p, ruleName, pairAcc, nextCond);
      }
      continue;
    }

    record(nextProp, val, ctx, families, p, ruleName, pairAcc, nextCond);
  }
}

function snippet(node, src) {
  if (node.start == null || node.end == null) return '?';
  const s = src.slice(node.start, node.end).replace(/\s+/g, ' ');
  return s.length > 52 ? s.slice(0, 51) + '…' : s;
}

function record(
  prop,
  valueNode,
  ctx,
  families,
  propNode,
  ruleName,
  pairAcc,
  cond = [],
) {
  const out = ctx.out;
  const fam = familyOf(prop, families);
  const res = classify(valueNode, ctx);
  const line = propNode.loc ? propNode.loc.start.line : 0;

  out.declarations += 1;

  // The styled unit — one entry per `stylex.create` key. This is the node the
  // graph is built from and the thing a diff reports as changed.
  const unitId = `${ctx.file}#${ruleName}`;
  let unit = out.units.get(unitId);
  if (!unit) {
    unit = {
      id: unitId,
      file: ctx.file,
      name: ruleName,
      line,
      declarations: [],
      tokens: [],
    };
    out.units.set(unitId, unit);
  }
  if (line && line < unit.line) unit.line = line;
  const decl = {
    prop,
    cond: cond.length ? cond.join(' > ') : 'default',
    cat: res.cat,
    family: fam ? fam.id : null,
  };
  if (res.cat === CAT.TOKEN) {
    decl.token = res.token;
    if (!unit.tokens.includes(res.token)) unit.tokens.push(res.token);
  } else if (res.cat === CAT.LITERAL) {
    decl.value = res.value;
    if (fam) decl.rule = fam.rule;
  }
  unit.declarations.push(decl);

  // Collect co-declared foreground/background/size for contrast analysis,
  // keyed by CONDITION. A `:hover` colour must never be paired with the
  // `default` background — that reports a pass on text that is invisible at
  // rest, which is the worst mistake an accessibility check can make.
  if (
    prop === 'color' ||
    prop === 'backgroundColor' ||
    prop === 'fontSize' ||
    prop === 'fontWeight'
  ) {
    const key = `${ctx.file}::${ruleName}`;
    pairAcc[key] = pairAcc[key] || { file: ctx.file, rule: ruleName, line, byCond: {} };
    const condKey = cond.length ? cond.join(' > ') : 'default';
    const slot = (pairAcc[key].byCond[condKey] = pairAcc[key].byCond[condKey] || {});
    slot[prop] = res.cat === CAT.TOKEN ? { token: res.token } : { literal: res.value };
    out.pairs.set(key, pairAcc[key]);
  }

  if (!fam) {
    out.untokenizable += 1;
    return;
  }

  out.byCat[res.cat] = (out.byCat[res.cat] || 0) + 1;
  out.byFamily[fam.id] = out.byFamily[fam.id] || { token: 0, literal: 0 };
  if (res.cat === CAT.TOKEN) out.byFamily[fam.id].token += 1;

  // Per-file tallies. An allow-listed file must leave the score entirely —
  // dropping only its literals while keeping its tokens would let a team raise
  // their number by allow-listing their BEST files.
  if (res.cat === CAT.TOKEN || res.cat === CAT.LITERAL) {
    let f = out.byFile.get(ctx.file);
    if (!f) {
      f = { token: 0, literal: 0, families: {} };
      out.byFile.set(ctx.file, f);
    }
    f[res.cat] += 1;
    f.families[fam.id] = f.families[fam.id] || { token: 0, literal: 0 };
    f.families[fam.id][res.cat] += 1;
  }

  if (res.cat === CAT.LITERAL) {
    out.byFamily[fam.id].literal += 1;
    out.violations.push({
      file: ctx.file,
      line,
      styleRule: ruleName,
      prop,
      family: fam.id,
      rule: fam.rule,
      why: fam.why,
      value: snippet(valueNode, ctx.src),
    });
  }
}
