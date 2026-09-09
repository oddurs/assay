/**
 * Dogfood step. Runs the real Assay on this site's own source and writes the
 * result into src/generated/report.json, which the page then renders.
 *
 * The numbers on the site are not typed in. If someone hardcodes a hex
 * tomorrow, the score on the homepage drops on the next build.
 *
 *   node scripts/assay-report.mjs          write the report
 *   node scripts/assay-report.mjs --gate   also fail the build below threshold
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyze } from '../../src/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../src');
const OUT = resolve(here, '../src/generated/report.json');

// The generated report is not source. Excluding it keeps the tool from
// measuring its own output.
const r = await analyze(SRC, { overrides: { exclude: ['generated'] } });

const families = r.families;

const report = {
  generatedAt: new Date().toISOString(),
  score: r.score ?? 1,
  token: r.token,
  literal: r.literal,
  scored: r.scored,
  excluded: r.excluded,
  files: r.stats.files,
  callSites: r.stats.callSites,
  tokensDefined: r.tokens.defined.length,
  dead: r.tokens.dead.map((d) => d.split('#').pop()),
  contrast: {
    level: r.contrast.level,
    checked: r.contrast.checked,
    failing: r.contrast.failing.length,
    unpaired: r.contrast.unpaired,
  },
  families,
  violations: r.violations.map((v) => ({
    file: v.file, line: v.line, prop: v.prop, family: v.family, value: v.value,
  })),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(report, null, 2));

const pct = (report.score * 100).toFixed(1);
console.log(`\n  assay · this site`);
console.log(`  ${'─'.repeat(46)}`);
console.log(`  ${pct}%  ${report.token}/${report.scored} scored declarations use a token`);
console.log(`  ${report.tokensDefined} tokens defined · ${report.dead.length} unreferenced · ${report.files} files`);
console.log(`  contrast ${report.contrast.level}: ${report.contrast.checked} real pairings, ${report.contrast.failing} failing`);
console.log(`  excluded: ${report.excluded.dynamic} dynamic · ${report.excluded.untokenizable} non-token props\n`);

if (report.violations.length) {
  console.log('  literals outside the primitives layer:');
  for (const v of report.violations.slice(0, 20)) {
    console.log(`    ${v.file}:${v.line}  ${v.prop}: ${v.value}`);
  }
  console.log('');
}

if (process.argv.includes('--gate')) {
  const THRESHOLD = 1;
  if (report.score < THRESHOLD) {
    console.error(`  ✗ conformance ${pct}% is below the ${THRESHOLD * 100}% gate\n`);
    process.exit(1);
  }
  console.log(`  ✓ conformance gate passed\n`);
}
