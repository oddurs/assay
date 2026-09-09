/**
 * The extractor. Walks stylex.create / defineVars / defineConsts / createTheme
 * call sites and emits, per file, every style declaration with its provenance.
 *
 * Token references are resolved to a MODULE PATH, not a bare namespace name —
 * so two packages that both export `colors` don't alias into each other.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolveModule } from './resolve.js';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import { CAT, NEUTRAL_VALUES, GEOMETRY, familyOf } from './taxonomy.js';

const traverse = _traverse.default ?? _traverse;

const TOKEN_MODULE = /\.stylex(\.[cm]?[jt]sx?)?$/;
const STYLE_APIS = new Set(['create', 'keyframes']);
const DEFINE_APIS = new Set([
  'defineVars', 'defineConsts',
  'unstable_defineVarsNested', 'unstable_defineConstsNested',
]);
const THEME_APIS = new Set(['createTheme', 'unstable_createThemeNested']);

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
    if (n.type === 'Identifier' && params.has(n.name)) { found = true; return; }
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
  /** local name -> { module, exportName } */
  const tokenImports = new Map();

  traverse(ast, {
    ImportDeclaration(path) {
      const spec = path.node.source.value;
      const fromTokens = TOKEN_MODULE.test(spec);
      const mod = fromTokens ? resolveModule(modId, spec, aliases) : null;
      for (const s of path.node.specifiers) {
        if (s.type === 'ImportNamespaceSpecifier' || s.type === 'ImportDefaultSpecifier') {
          if (isStylexPkg(spec)) stylexNames.add(s.local.name);
          else if (fromTokens) tokenImports.set(s.local.name, { module: mod, exportName: '*' });
        } else if (s.type === 'ImportSpecifier') {
          const imported = s.imported.name ?? s.imported.value;
          if (isStylexPkg(spec)) bareApis.set(s.local.name, imported);
          else if (fromTokens) tokenImports.set(s.local.name, { module: mod, exportName: imported });
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
    ) return callee.property.name;
    if (callee.type === 'Identifier' && bareApis.has(callee.name)) return bareApis.get(callee.name);
    return null;
  };

  // Pass 2: token namespaces declared in THIS file (define + use in one place).
  traverse(ast, {
    VariableDeclarator(path) {
      const init = path.node.init;
      if (!init || init.type !== 'CallExpression') return;
      const api = apiOf(init.callee);
      if (api && DEFINE_APIS.has(api) && path.node.id.type === 'Identifier') {
        tokenImports.set(path.node.id.name, { module: modId, exportName: path.node.id.name });
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
            for (const par of p.value.params) if (par.type === 'Identifier') params.add(par.name);
            if (p.value.body.type === 'ObjectExpression') {
              walkStyle(p.value.body, { ...ctx, params }, families, null, ruleName, {});
            }
          }
        }
        return;
      }

      if (THEME_APIS.has(api)) {
        for (const a of path.node.arguments) recordRefs(a, ctx);
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
    ctx.out.tokens.set(`${nsId}.${path}`, {
      id: `${nsId}.${path}`,
      file: ctx.file,
      name: path,
      value: p.value,
      src: ctx.src,
      // Bound to THIS file's imports, so a semantic token can resolve the
      // primitive it points at even though that lives in another module.
      resolveRef: ctx.tokenIdOf,
    });
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
        const v = node.quasis.map((q) => q.value.cooked).join('').trim();
        if (NEUTRAL_VALUES.has(v)) return { cat: CAT.NEUTRAL };
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

function walkStyle(obj, ctx, families, prop, ruleName, pairAcc) {
  for (const p of obj.properties) {
    if (p.type !== 'ObjectProperty') continue;
    const name = propName(p);
    const nextProp = prop && (name === null || isConditionalKey(name)) ? prop : name;
    if (!nextProp) continue;

    const val = p.value;

    if (val.type === 'ObjectExpression') {
      walkStyle(val, ctx, families, nextProp, ruleName, pairAcc);
      continue;
    }
    if (val.type === 'ArrowFunctionExpression' || val.type === 'FunctionExpression') {
      const params = new Set(ctx.params);
      for (const par of val.params) if (par.type === 'Identifier') params.add(par.name);
      const sub = { ...ctx, params };
      if (val.body.type === 'ObjectExpression') {
        walkStyle(val.body, sub, families, nextProp, ruleName, pairAcc);
      } else {
        record(nextProp, val.body, sub, families, p, ruleName, pairAcc);
      }
      continue;
    }

    record(nextProp, val, ctx, families, p, ruleName, pairAcc);
  }
}

function snippet(node, src) {
  if (node.start == null || node.end == null) return '?';
  const s = src.slice(node.start, node.end).replace(/\s+/g, ' ');
  return s.length > 52 ? s.slice(0, 51) + '…' : s;
}

function record(prop, valueNode, ctx, families, propNode, ruleName, pairAcc) {
  const out = ctx.out;
  const fam = familyOf(prop, families);
  const res = classify(valueNode, ctx);
  const line = propNode.loc ? propNode.loc.start.line : 0;

  out.declarations += 1;

  // Collect co-declared foreground/background/size for contrast analysis.
  if (prop === 'color' || prop === 'backgroundColor' || prop === 'fontSize' || prop === 'fontWeight') {
    const key = `${ctx.file}::${ruleName}`;
    pairAcc[key] = pairAcc[key] || { file: ctx.file, rule: ruleName, line };
    pairAcc[key][prop] = res.cat === CAT.TOKEN ? { token: res.token } : { literal: res.value };
    out.pairs.set(key, pairAcc[key]);
  }

  if (!fam) { out.untokenizable += 1; return; }

  out.byCat[res.cat] = (out.byCat[res.cat] || 0) + 1;
  out.byFamily[fam.id] = out.byFamily[fam.id] || { token: 0, literal: 0 };
  if (res.cat === CAT.TOKEN) out.byFamily[fam.id].token += 1;

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
