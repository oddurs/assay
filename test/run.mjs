/**
 * Tests. The scoring assertions are the original M0 hand count — every number
 * was counted by hand from test/fixtures, with the reasoning written into the
 * fixture comments. They are the regression net for every refactor since.
 */
import { analyze, parseColor, ratio } from '../src/index.js';
import { globToRegExp } from '../src/config.js';

let pass = 0, fail = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function check(name, got, want) {
  const ok = eq(got, want);
  ok ? pass++ : fail++;
  const g = Array.isArray(got) ? got.join(',') : got;
  const w = Array.isArray(want) ? want.join(',') : want;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(34)} ${ok ? '' : `expected ${w}, got ${g}`}`);
}

console.log('\n  scoring — the M0 hand count');
{
  const r = await analyze('./test/fixtures');
  check('token', r.token, 6);
  check('literal', r.literal, 10);
  check('scored', r.scored, 16);
  check('score', Number(r.score.toFixed(4)), 0.375);
  check('dynamic', r.excluded.dynamic, 1);
  check('neutral', r.excluded.neutral, 3);
  check('untokenizable', r.excluded.untokenizable, 5);
  check('tokens defined', r.tokens.defined.length, 7);
  check('dead tokens', r.tokens.dead.map((d) => d.split('#')[1]).sort(),
    ['colors.bg', 'colors.unusedBorder']);
  check('no parse failures', r.stats.unparsed.length, 0);
  check('every violation cites a rule', r.violations.every((v) => !!v.rule), true);
  check('token values resolve', r.tokens.values[
    r.tokens.defined.find((d) => d.endsWith('colors.fg'))], '#101317');
}

console.log('\n  colour maths');
{
  check('white on black', Math.round(ratio(parseColor('#fff'), parseColor('#000'))), 21);
  check('hex shorthand', parseColor('#fff'), { r: 255, g: 255, b: 255, a: 1 });
  check('rgba alpha', parseColor('rgba(0,0,0,0.5)').a, 0.5);
  check('hsl parses', parseColor('hsl(0,0%,100%)').r, 255);
  check('unparseable is null', parseColor('not-a-colour'), null);
}

console.log('\n  contrast on real pairings');
{
  const r = await analyze('./test/contrast-fixtures');
  const by = Object.fromEntries(r.contrast.results.map((x) => [x.styleRule, x]));
  check('checked pairs', r.contrast.checked, 5);
  check('good passes', by.good.passes, true);
  check('faint fails', by.faint.passes, false);
  check('large text uses 3.0', by.largeBrand.required, 3);
  check('large text passes', by.largeBrand.passes, true);
  check('same colour small fails', by.smallBrand.passes, false);
  check('small text uses 4.5', by.smallBrand.required, 4.5);
  check('inherited bg not checked', by.inherited, undefined);
  check('inherited counted unpaired', r.contrast.unpaired, 1);
  check('failing count', r.contrast.failing.length, 2);
  // Regression: a semantic token pointing at a primitive in another module
  // must resolve through the chain, not throw.
  check('chained token resolves', by.viaChain.fg, '#111111');
  check('chained token passes', by.viaChain.passes, true);
}

console.log('\n  module resolution');
{
  // Both patterns are ubiquitous in real repos and both silently degraded
  // every token to "unresolved" before they were handled.
  const r = await analyze('./test/resolve-fixtures');
  check('tsconfig alias resolves', r.token, 2);
  check('computed string key resolves', r.literal, 1);
  check('score', Number(r.score.toFixed(4)), 0.6667);
  check('unresolved expressions', r.excluded.expr, 0);
  check('dead token found', r.tokens.dead.map((d) => d.split('#')[1]), ['vars.unusedOne']);
}

console.log('\n  config');
{
  check('glob **', globToRegExp('**/*.tsx').test('a/b/c.tsx'), true);
  check('glob * scoped', globToRegExp('src/*.ts').test('src/a/b.ts'), false);
  check('glob braces', globToRegExp('**/*.{ts,tsx}').test('x/y.tsx'), true);

  const r = await analyze('./test/fixtures', {
    overrides: { allow: ['Legacy.tsx'] },
  });
  check('allow-list removes violations', r.literal, 5);
  check('allow-list keeps them visible', r.suppressed.length, 5);
  check('allow-list raises score', Number(r.score.toFixed(4)), 0.5455);

  const d = await analyze('./test/fixtures', {
    overrides: { disableFamilies: ['color'] },
  });
  check('disabling a family rescopes', d.families.some((f) => f.name === 'color'), false);

  const p = await analyze('./test/fixtures', {
    overrides: { publishesTokens: true },
  });
  check('publishesTokens disables dead', p.tokens.dead.length, 0);
}

console.log(`\n  ${fail === 0 ? `✓ ${pass} passed` : `✗ ${fail} failed, ${pass} passed`}\n`);
process.exit(fail === 0 ? 0 : 1);
