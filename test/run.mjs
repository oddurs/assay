/**
 * Tests. The scoring assertions are the original M0 hand count — every number
 * was counted by hand from test/fixtures, with the reasoning written into the
 * fixture comments. They are the regression net for every refactor since.
 */
import { audit as analyze, parseColor, ratio } from '@stylegraph/audit';
import { buildGraph } from '@stylegraph/extract';
import {
  diffGraphs,
  blastRadius,
  graphHash,
  validateGraph,
  runConformance,
  hashOf,
} from '@stylegraph/spec';
import { globToRegExp } from '@stylegraph/extract';

let pass = 0,
  fail = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function check(name, got, want) {
  const ok = eq(got, want);
  ok ? pass++ : fail++;
  const g = Array.isArray(got) ? got.join(',') : got;
  const w = Array.isArray(want) ? want.join(',') : want;
  console.log(
    `  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(34)} ${ok ? '' : `expected ${w}, got ${g}`}`,
  );
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
  check('dead tokens', r.tokens.dead.map((d) => d.split('#')[1]).sort(), [
    'colors.bg',
    'colors.unusedBorder',
  ]);
  check('no parse failures', r.stats.unparsed.length, 0);
  check(
    'every violation cites a rule',
    r.violations.every((v) => !!v.rule),
    true,
  );
  check(
    'token values resolve',
    r.tokens.values[r.tokens.defined.find((d) => d.endsWith('colors.fg'))],
    '#101317',
  );
}

console.log('\n  colour maths');
{
  check(
    'white on black',
    Math.round(ratio(parseColor('#fff'), parseColor('#000'))),
    21,
  );
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
  check(
    'dead token found',
    r.tokens.dead.map((d) => d.split('#')[1]),
    ['vars.unusedOne'],
  );
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
  check(
    'disabling a family rescopes',
    d.families.some((f) => f.name === 'color'),
    false,
  );

  const p = await analyze('./test/fixtures', {
    overrides: { publishesTokens: true },
  });
  check('publishesTokens disables dead', p.tokens.dead.length, 0);
}

console.log('\n  graph v1');
{
  const r = await analyze('./test/graph-fixtures/base');
  const g = buildGraph(r);
  check('version', g.version, 1);
  check('adapter recorded', g.generator.adapter, 'stylex');
  check(
    'ids are root-relative',
    Object.keys(g.units).includes('Widget.tsx#button'),
    true,
  );
  check(
    'token ids are root-relative',
    Object.keys(g.tokens).includes('tokens.stylex.ts#colors.accent'),
    true,
  );
  check(
    'token resolves through chain',
    g.tokens['tokens.stylex.ts#colors.accent'].value,
    '#7C5CFF',
  );
  check(
    'token -> token edge recorded',
    g.tokens['tokens.stylex.ts#colors.accent'].refs,
    ['tokens.stylex.ts#palette.brand'],
  );
  check(
    'conditions distinguish declarations',
    g.units['Widget.tsx#button'].declarations.filter(
      (d) => d.prop === 'backgroundColor',
    ).length,
    2,
  );
  check('unit denormalises its tokens', g.units['Widget.tsx#button'].tokens.length, 2);

  // Determinism: two builds of the same tree must be identical apart from time.
  const g2 = buildGraph(await analyze('./test/graph-fixtures/base'));
  check('graph hash is stable', graphHash(g), graphHash(g2));
  check('generatedAt is not hashed', g.generatedAt === g2.generatedAt, false);
}

console.log('\n  blast radius');
{
  const g = buildGraph(await analyze('./test/graph-fixtures/base'));
  // The primitive is referenced by NO unit directly — only via colors.accent.
  const direct = Object.values(g.units).filter((u) =>
    u.tokens.includes('tokens.stylex.ts#palette.brand'),
  );
  check('primitive has no direct unit refs', direct.length, 0);

  const r = blastRadius(g, ['tokens.stylex.ts#palette.brand']);
  check(
    'closure follows token edges',
    r.tokens.includes('tokens.stylex.ts#colors.accent'),
    true,
  );
  check('reaches units via the semantic layer', r.units.map((u) => u.id).sort(), [
    'Widget.tsx#button',
    'Widget.tsx#gone',
  ]);
  check('reports files', r.files, ['Widget.tsx']);
}

console.log('\n  diff');
{
  const base = buildGraph(await analyze('./test/graph-fixtures/base'));
  const head = buildGraph(await analyze('./test/graph-fixtures/head'));
  const d = diffGraphs(base, head);

  check('token value change detected', d.tokens.changed.length, 2);
  check(
    'changed token reports both values',
    d.tokens.changed.find((t) => t.id.endsWith('palette.brand')).to,
    '#22AA88',
  );
  check('unit added', d.units.added, ['Widget.tsx#added']);
  check('unit removed', d.units.removed, ['Widget.tsx#gone']);
  check(
    'style change found',
    d.units.styleChanged.map((u) => u.id),
    ['Widget.tsx#label'],
  );
  check(
    'the change is the added declaration',
    d.units.styleChanged[0].changes.map((c) => c.kind),
    ['added'],
  );
  // The unchanged unit moved two lines down in head. Hash covers what renders,
  // not where it sits, so it must NOT appear as changed.
  check(
    'moved code is not a style change',
    d.units.styleChanged.some((u) => u.id === 'Widget.tsx#button'),
    false,
  );
  check('blast radius from the diff', d.blastRadius.units.map((u) => u.id).sort(), [
    'Widget.tsx#added',
    'Widget.tsx#button',
  ]);

  const same = diffGraphs(base, base);
  check('identical graphs diff empty', same.summary.unitsStyleChanged, 0);
  check('identical graphs: no token churn', same.summary.tokensChanged, 0);
}

console.log('\n  regressions');
{
  const r = await analyze('./test/bug-fixtures');

  // A `:hover` colour must not be paired with the `default` background.
  // This reported a 14.59:1 PASS on text that is invisible at rest.
  const tricky = r.contrast.results.filter((x) => x.styleRule === 'tricky');
  check('both conditions are checked', tricky.length, 2);
  check('default state fails', tricky.find((x) => x.cond === 'default').passes, false);
  check('default state is 1:1', tricky.find((x) => x.cond === 'default').ratio, 1);
  check('hover state passes', tricky.find((x) => x.cond === ':hover').passes, true);

  // Zero needs no token, with or without a unit.
  const zeroViolations = r.violations.filter((v) => v.styleRule === 'zeros');
  check('0px/0rem/0 are not violations', zeroViolations.length, 0);

  // Allow-listing must remove a file's tokens AND its literals. Removing only
  // the literals lets a team raise the score by allow-listing good files.
  const all = await analyze('./test/bug-fixtures');
  const allowed = await analyze('./test/bug-fixtures', {
    overrides: { allow: ['Cases.tsx'] },
  });
  check('allow-list removes tokens too', allowed.token, 0);
  check('allow-list removes literals too', allowed.literal, 0);
  check('unallowed baseline has both', all.token > 0 && all.literal > 0, true);

  // A glass panel over a dark page was reported as a contrast FAILURE because
  // the near-transparent white film was treated as an opaque near-white ground.
  check(
    'translucent bg is not judged',
    r.contrast.results.some((x) => x.styleRule === 'plate'),
    false,
  );
  check('translucent bg counts as unresolvable', r.contrast.unpaired >= 1, true);

  // rgb(0 0 0 / 50%) is legal CSS; parseFloat made alpha 50 instead of 0.5.
  check('percentage alpha', parseColor('rgb(0 0 0 / 50%)').a, 0.5);
  check(
    'percentage alpha composites',
    Math.round(ratio(parseColor('rgb(0 0 0 / 50%)'), parseColor('#fff'))),
    4,
  );
}

console.log('\n  theme-aware contrast');
{
  // Resolving tokens to their BASE values only ever checked the default theme.
  // On our own site that reported three of four themes as passing while they
  // carried AA failures — a checker returning a false pass.
  const r = await analyze('./test/theme-fixtures');

  check('base theme passes', r.contrast.failing.length, 0);
  check('a theme-only failure is caught', r.contrastFailing.length, 1);
  check('the failure names its theme', r.contrastFailing[0].theme, 'washed');
  check('and reports the themed value', r.contrastFailing[0].fg, '#BBBBBB');
  check('ratio is computed under the theme', r.contrastFailing[0].ratio < 2, true);

  // A theme of corner radii cannot change a contrast verdict; running it would
  // repeat the base result under a misleading name.
  check(
    'themes touching no colour are skipped',
    r.contrastByTheme.map((t) => t.theme),
    ['washed'],
  );

  const g = buildGraph(r);
  check('themes reach the graph', Object.keys(g.themes).length, 2);
  const washed = Object.values(g.themes).find((t) => t.name === 'washed');
  check(
    'the graph carries resolved override values',
    Object.values(washed.overrides)[0],
    '#BBBBBB',
  );
}

console.log('\n  format conformance');
{
  const { readFileSync } = await import('node:fs');
  const fixture = JSON.parse(
    readFileSync(
      new URL('../packages/spec/fixtures/valid.json', import.meta.url),
      'utf8',
    ),
  );

  check('the fixture validates', validateGraph(fixture).ok, true);

  // Every mutation must be rejected AND name the field it broke. A validator
  // that says "invalid" is useless to whoever has to fix the producer.
  const suite = runConformance(fixture);
  check('every conformance case passes', suite.ok, true);
  check('the suite is not empty', suite.ran > 10, true);
  if (!suite.ok) console.log('   ', JSON.stringify(suite.failures, null, 1));

  // What a real producer emits must satisfy the spec, not just the fixture.
  const live = buildGraph(await analyze('./site/src'));
  check('a real graph validates', validateGraph(live).ok, true);

  // The agreement that lets a diff be a hash comparison: two producers ordering
  // declarations differently must still agree.
  const unit = Object.values(live.units).find((u) => u.declarations.length > 2);
  const shuffled = [...unit.declarations].reverse();
  check(
    'hash is independent of declaration order',
    hashOf(
      [...shuffled].sort((a, b) =>
        a.prop === b.prop ? (a.cond < b.cond ? -1 : 1) : a.prop < b.prop ? -1 : 1,
      ),
    ),
    unit.hash,
  );
}

console.log('\n  DTCG bridge');
{
  const { toDTCG, fromDTCG, toColor, fromColor } = await import('@stylegraph/tokens');

  // 2025.10 takes a structured colour, not a hex string. Emitting "#7350F5"
  // produces a document that looks right and validates nowhere.
  const c = toColor('#7350F5');
  check('colour is an object, not a string', typeof c, 'object');
  check('colour space is named', c.colorSpace, 'srgb');
  check(
    'sRGB components are 0-1',
    c.components.every((n) => n >= 0 && n <= 1),
    true,
  );
  check('hex fallback is carried', c.hex, '#7350f5');
  check('opaque colours omit alpha', 'alpha' in c, false);
  check('alpha survives', toColor('rgba(0, 0, 0, 0.5)').alpha, 0.5);
  check('colour round-trips', fromColor(toColor('#7350F5')), '#7350f5');

  const g = buildGraph(await analyze('./site/src'));
  const { document, lossy } = toDTCG(g);

  // The whole reason to do this properly: structure survives.
  check(
    'an alias stays an alias',
    document.colors.accent.$value,
    '{palette.violet500}',
  );
  check(
    'a primitive carries a real value',
    typeof document.palette.violet500.$value,
    'object',
  );
  check('$type is hoisted onto a uniform group', document.space.$type, 'dimension');
  check('and removed from its leaves', 'type' in (document.space.gutter ?? {}), false);

  // What cannot be carried is reported, never dropped silently.
  check('lossy values are reported', lossy.length > 0, true);
  check(
    'and each says why',
    lossy.every((l) => typeof l.reason === 'string'),
    true,
  );

  const { files } = fromDTCG(document);
  check('one file per group', files['colors.stylex.ts'] !== undefined, true);
  // An alias inlined as a hex value throws away the structure the designer set.
  check(
    'an alias becomes an import, not a value',
    /import \{ palette \} from '\.\/palette\.stylex';/.test(files['colors.stylex.ts']),
    true,
  );
  check(
    'and is referenced, not inlined',
    /accent: palette\.violet500,/.test(files['colors.stylex.ts']),
    true,
  );
  check(
    'regenerating is byte-identical',
    fromDTCG(JSON.parse(JSON.stringify(document))).files['colors.stylex.ts'],
    files['colors.stylex.ts'],
  );
}

console.log(
  `\n  ${fail === 0 ? `✓ ${pass} passed` : `✗ ${fail} failed, ${pass} passed`}\n`,
);
process.exit(fail === 0 ? 0 : 1);
