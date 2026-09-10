/**
 * Module resolution.
 *
 * Token identity is a resolved file path, not a bare namespace name — so two
 * packages that both export `colors` never alias into each other. That only
 * works if we can actually resolve the import, which means understanding
 * tsconfig path aliases. They are everywhere, and without them every
 * alias-imported token silently degrades to "unresolved expression" and the
 * score collapses for reasons nobody can see.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve as resolvePath, join, parse as parsePath } from 'node:path';

const EXTS = [
  '',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '/index.ts',
  '/index.tsx',
  '/index.js',
  '/index.jsx',
];

/** tsconfig allows comments and trailing commas; JSON.parse does not. */
function parseJsonc(text) {
  const stripped = text
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, c) => (c ? ' ' : m))
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(stripped);
}

const configCache = new Map();

/** Nearest tsconfig/jsconfig walking up from a directory, with `extends`. */
function findConfig(dir, stopAt, depth = 0) {
  if (configCache.has(dir)) return configCache.get(dir);

  let result = null;
  for (const name of ['tsconfig.json', 'jsconfig.json']) {
    const p = join(dir, name);
    if (!existsSync(p)) continue;
    try {
      let cfg = parseJsonc(readFileSync(p, 'utf8'));
      // Follow one level of `extends` for the common shared-base case.
      if (cfg.extends && typeof cfg.extends === 'string' && depth < 3) {
        const basePath = cfg.extends.startsWith('.')
          ? resolvePath(dir, cfg.extends)
          : null;
        for (const ext of ['', '.json']) {
          if (basePath && existsSync(basePath + ext)) {
            const base = parseJsonc(readFileSync(basePath + ext, 'utf8'));
            cfg = {
              ...base,
              ...cfg,
              compilerOptions: {
                ...(base.compilerOptions ?? {}),
                ...(cfg.compilerOptions ?? {}),
              },
            };
            break;
          }
        }
      }
      const co = cfg.compilerOptions ?? {};
      if (co.paths) {
        result = { dir, baseUrl: resolvePath(dir, co.baseUrl ?? '.'), paths: co.paths };
      }
    } catch {
      /* malformed config: fall through to the parent */
    }
    break;
  }

  if (!result) {
    const parent = dirname(dir);
    const atRoot = parent === dir || parsePath(dir).root === dir;
    if (!atRoot && dir !== stopAt && dir.length > 1) {
      result = findConfig(parent, stopAt, depth);
    }
  }

  configCache.set(dir, result);
  return result;
}

function tryExtensions(base) {
  for (const ext of EXTS) {
    const cand = base + ext;
    try {
      if (existsSync(cand) && statSync(cand).isFile()) return cand;
    } catch {
      /* keep trying */
    }
  }
  return null;
}

/**
 * Resolve an import specifier to a file path.
 * Falls back to the raw specifier so bare package imports still get a stable,
 * if coarse, identity.
 */
export function resolveModule(fromFile, spec, extraAliases = {}) {
  if (spec.startsWith('.')) {
    const base = resolvePath(dirname(fromFile), spec);
    return tryExtensions(base) ?? base;
  }

  // Config-supplied aliases win over discovered ones.
  const cfg = findConfig(dirname(fromFile));
  const tables = [];
  if (Object.keys(extraAliases).length) {
    tables.push({ baseUrl: null, paths: extraAliases });
  }
  if (cfg) tables.push(cfg);

  for (const table of tables) {
    for (const [pattern, targets] of Object.entries(table.paths)) {
      const star = pattern.indexOf('*');
      let rest = null;
      if (star === -1) {
        if (spec !== pattern) continue;
        rest = '';
      } else {
        const head = pattern.slice(0, star);
        const tail = pattern.slice(star + 1);
        if (!spec.startsWith(head) || !spec.endsWith(tail)) continue;
        rest = spec.slice(head.length, spec.length - tail.length);
      }
      for (const target of Array.isArray(targets) ? targets : [targets]) {
        const filled = target.replace('*', rest);
        const base = table.baseUrl
          ? resolvePath(table.baseUrl, filled)
          : resolvePath(dirname(fromFile), filled);
        const hit = tryExtensions(base);
        if (hit) return hit;
      }
    }
  }

  return spec;
}

export function clearResolveCache() {
  configCache.clear();
}
