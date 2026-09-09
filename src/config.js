/**
 * Config. Assay ships an opinion; this is how you disagree with it in a way
 * that is written down, reviewable, and applies to everyone on the team.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join, dirname, parse as parsePath } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULTS = {
  exclude: [],
  aliases: {},
  disableFamilies: [],
  allow: [],
  threshold: null,
  owners: {},
  contrast: { level: 'AA', enabled: true },
  skipDirs: [
    'node_modules', '.git', 'dist', 'build', 'out', '.next', 'coverage',
    '.turbo', '.yarn', '__snapshots__',
  ],
  skipTests: true,
  publishesTokens: false,
};

const NAMES = [
  'assay.config.js', 'assay.config.mjs', 'assay.config.json', '.assayrc.json',
];

/**
 * Search the analyzed path, then walk up. You put the config at the project
 * root and analyze `src`; looking only in `src` means the gate silently never
 * fires, which is worse than erroring.
 */
function findConfigFile(root) {
  let dir = resolve(root);
  const fsRoot = parsePath(dir).root;
  for (;;) {
    for (const name of NAMES) {
      const p = join(dir, name);
      if (existsSync(p)) return p;
    }
    const parent = dirname(dir);
    if (parent === dir || dir === fsRoot) return null;
    dir = parent;
  }
}

export async function loadConfig(root, overrides = {}) {
  let found = null;
  const file = findConfigFile(root);

  if (file) {
    if (file.endsWith('.json')) {
      found = JSON.parse(readFileSync(file, 'utf8'));
    } else {
      const mod = await import(pathToFileURL(file).href);
      found = mod.default ?? mod.config ?? {};
    }
  }

  const cfg = {
    ...DEFAULTS,
    ...(found ?? {}),
    ...overrides,
    contrast: {
      ...DEFAULTS.contrast,
      ...(found?.contrast ?? {}),
      ...(overrides.contrast ?? {}),
    },
    skipDirs: [...DEFAULTS.skipDirs, ...(found?.skipDirs ?? [])],
  };
  cfg.configFile = file ? resolve(file) : null;
  return cfg;
}

/**
 * Path matching. Supports the glob forms that actually come up in a config —
 * `**` across directories, `*` within a segment, `{a,b}` alternates — plus a
 * plain substring fallback, so `exclude: ["benchmarks"]` does what you expect.
 */
export function globToRegExp(glob) {
  let src = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i += 1;
        if (glob[i + 1] === '/') i += 1;
        src += '(?:.*/)?';
      } else {
        src += '[^/]*';
      }
    } else if (c === '?') {
      src += '[^/]';
    } else if (c === '{') {
      const end = glob.indexOf('}', i);
      if (end === -1) { src += '\\{'; continue; }
      const alts = glob.slice(i + 1, end).split(',');
      src += `(?:${alts.map((a) => a.replace(/[.+^${}()|[\]\\]/g, '\\$&')).join('|')})`;
      i = end;
    } else if ('.+^$()|[]\\'.includes(c)) {
      src += '\\' + c;
    } else {
      src += c;
    }
  }
  return new RegExp(`^${src}$`);
}

export function matcher(globs) {
  if (!globs || globs.length === 0) return () => false;
  const res = globs.map(globToRegExp);
  return (p) => res.some((re) => re.test(p)) || globs.some((g) => !g.includes('*') && p.includes(g));
}

/** Map a file to its owning team, first match wins. */
export function ownerOf(file, owners) {
  for (const [team, globs] of Object.entries(owners)) {
    const list = Array.isArray(globs) ? globs : [globs];
    if (matcher(list)(file)) return team;
  }
  return null;
}
