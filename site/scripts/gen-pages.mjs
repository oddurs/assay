/**
 * One HTML file per package, generated from the family.
 *
 * Multi-page rather than a router: GitHub Pages serves real files at real paths
 * with no 404 fallback to configure, each page ships only its own bundle, and a
 * deep link works on first load. Seven hand-written pages would drift; one
 * template cannot.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPackages } from './packages.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(here, '..');

const template = readFileSync(join(SITE, 'index.html'), 'utf8');

const pages = readPackages().map((p) => ({
  slug: p.name,
  title: `${p.pkg} — stylegraph`,
  description: p.description,
}));

for (const page of pages) {
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${page.description}$2`,
    )
    .replace('/src/main.tsx', '/src/entries/project.tsx')
    .replace(
      '<div id="root"></div>',
      `<div id="root" data-project="${page.slug}"></div>`,
    );

  const dir = join(SITE, page.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

console.log(`generated ${pages.length} package pages`);
