/**
 * The family, measured rather than described.
 *
 * Whether a package is written is derived from its source at build time — the
 * same rule the conformance score follows. A page that claims a package exists
 * while its entry point is a placeholder is the kind of drift this whole
 * project is about.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const PACKAGES = resolve(here, '../../packages');

const PLACEHOLDER = /export const NAME =/;

function sourceSize(dir) {
  let bytes = 0;
  let files = 0;
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(js|mjs)$/.test(name)) {
        bytes += st.size;
        files += 1;
      }
    }
  };
  if (existsSync(dir)) walk(dir);
  return { bytes, files };
}

export function readPackages() {
  return readdirSync(PACKAGES)
    .filter((name) => existsSync(join(PACKAGES, name, 'package.json')))
    .map((name) => {
      const pkg = JSON.parse(
        readFileSync(join(PACKAGES, name, 'package.json'), 'utf8'),
      );
      const src = join(PACKAGES, name, 'src');
      const entry = join(src, 'index.js');
      const body = existsSync(entry) ? readFileSync(entry, 'utf8') : '';
      const { bytes, files } = sourceSize(src);

      // A package is "written" when its entry point does more than name itself.
      const written = body.length > 0 && !(PLACEHOLDER.test(body) && body.length < 400);

      return {
        name,
        pkg: pkg.name,
        version: pkg.version,
        description: pkg.description,
        written,
        files,
        bytes,
        hasBin: Boolean(pkg.bin),
        dependsOn: Object.keys(pkg.dependencies ?? {}).filter((d) =>
          d.startsWith('@stylegraph/'),
        ),
      };
    })
    .sort(
      (a, b) => Number(b.written) - Number(a.written) || a.name.localeCompare(b.name),
    );
}
