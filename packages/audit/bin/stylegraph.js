#!/usr/bin/env node
/**
 * assay — compile-time design system conformance for StyleX.
 */
import { audit } from '../src/index.js';
import { loadConfig, FAMILIES, CAT_DOC } from '@stylegraph/extract';
import {
  renderSummary,
  renderTokens,
  renderContrast,
  renderDiff,
  bold,
  dim,
  green,
  red,
} from '../src/report.js';
import { buildGraph } from '@stylegraph/extract';
import { diffGraphs, blastRadius, GRAPH_VERSION } from '@stylegraph/spec';
import { resolveSide } from '../src/gitref.js';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';

const HELP = `
  stylegraph — what your design system actually shipped

  Usage
    stylegraph [path]                 score a tree (default: .)
    stylegraph tokens [path]          token inventory, resolved values, dead tokens
    stylegraph contrast [path]        contrast on pairings that actually occur
    stylegraph graph [path]           emit stylegraph.json v1
    stylegraph diff <base> <head>     what changed, and what it reaches
    stylegraph impact <token…> [path] blast radius of changing a token
    stylegraph rules                  the taxonomy: every rule and why it exists
    stylegraph explain                how the score is defined, and what it excludes

  diff / impact
    base and head may each be a path on disk or a git ref:
      stylegraph diff main HEAD
      stylegraph diff base-graph.json head-graph.json
      stylegraph diff ./old-src ./src
    --out <file>                 write the graph (graph) or the diff (diff) as JSON

  Options
    --json                       machine-readable output
    --path <dir>                 subdirectory to analyse when diffing refs
    --violations                 list every violation with its rule
    --exclude <glob>             skip paths (repeatable)
    --gate [n]                   exit 1 below n percent (default 100)
    --contrast-level <AA|AAA>    default AA
    --no-contrast                skip contrast analysis
    --publishes-tokens           this package exports tokens for consumers,
                                 so disable dead-token analysis
    --help, --version

  Exit codes
    0  passed        1  below gate        2  contrast failures with --gate
`;

function parseArgs(argv) {
  const args = { _: [], exclude: [], flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--exclude') args.exclude.push(argv[++i]);
    else if (a === '--gate') {
      args.gate = /^\d+(\.\d+)?$/.test(argv[i + 1] ?? '') ? Number(argv[++i]) : 100;
    } else if (a === '--contrast-level') args.contrastLevel = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--path') args.path = argv[++i];
    else if (a.startsWith('--')) args.flags.add(a.slice(2));
    else args._.push(a);
  }
  return args;
}

function renderRules() {
  const L = ['', `  ${bold('The taxonomy')}`, '  ' + dim('─'.repeat(58)), ''];
  L.push('  A property is scored only if it belongs to a token-bearing family.');
  L.push('  Everything else is counted and reported, never scored.');
  L.push('');
  for (const f of FAMILIES) {
    L.push(`  ${bold(f.rule)}  ${dim(`family: ${f.id}`)}`);
    L.push(`      ${f.why}`);
    L.push('');
  }
  L.push(`  ${bold('Outcomes')}`);
  for (const [k, v] of Object.entries(CAT_DOC)) {
    L.push(`  ${bold(k.padEnd(9))} ${v}`);
  }
  L.push('');
  return L.join('\n');
}

const VERSION = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;

const COMMANDS = new Set([
  'tokens',
  'contrast',
  'rules',
  'explain',
  'graph',
  'diff',
  'impact',
]);

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.flags.has('help') || args.flags.has('h')) {
    console.log(HELP);
    return 0;
  }
  if (args.flags.has('version')) {
    console.log(VERSION);
    return 0;
  }

  const cmd = COMMANDS.has(args._[0]) ? args._.shift() : 'score';
  if (cmd === 'rules') {
    console.log(renderRules());
    return 0;
  }

  const buildOverrides = () => {
    const o = {};
    if (args.exclude.length) o.exclude = args.exclude;
    if (args.contrastLevel) o.contrast = { level: args.contrastLevel };
    if (args.flags.has('no-contrast'))
      o.contrast = { ...(o.contrast ?? {}), enabled: false };
    if (args.flags.has('publishes-tokens')) o.publishesTokens = true;
    return o;
  };

  const graphOf = async (dir) => {
    const cfg = await loadConfig(dir, buildOverrides());
    const res = await audit(dir, { config: cfg });
    return buildGraph(res, { version: VERSION, adapter: res.adapter });
  };

  const loadSide = async (arg) => {
    // A .json argument is an already-built graph.
    if (arg.endsWith('.json')) {
      const g = JSON.parse(readFileSync(arg, 'utf8'));
      if (g.version !== GRAPH_VERSION) {
        throw new Error(
          `${arg} is stylegraph v${g.version}; this build reads v${GRAPH_VERSION}`,
        );
      }
      return { graph: g, label: arg, cleanup: () => {} };
    }
    const side = resolveSide(arg, { subpath: args.path });
    try {
      return { graph: await graphOf(side.dir), label: arg, cleanup: side.cleanup };
    } catch (e) {
      side.cleanup();
      throw e;
    }
  };

  if (cmd === 'diff') {
    if (args._.length < 2)
      throw new Error('diff needs two arguments: stylegraph diff <base> <head>');
    const [baseArg, headArg] = args._;
    const base = await loadSide(baseArg);
    let head;
    try {
      head = await loadSide(headArg);
    } catch (e) {
      base.cleanup();
      throw e;
    }

    try {
      const d = diffGraphs(base.graph, head.graph);
      if (args.out) writeFileSync(args.out, JSON.stringify(d, null, 2));
      if (args.flags.has('json')) console.log(JSON.stringify(d, null, 2));
      else console.log(renderDiff(d, { base: baseArg, head: headArg }));
      return 0;
    } finally {
      base.cleanup();
      head.cleanup();
    }
  }

  if (cmd === 'impact') {
    // The last argument is a directory only if it IS one. Popping it blindly
    // turns `stylegraph impact colors.accent colors.signal` into a search of a
    // directory named after the second token.
    const parts = [...args._];
    let dir = '.';
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      if (existsSync(last) && statSync(last).isDirectory()) dir = parts.pop();
    }
    if (!parts.length)
      throw new Error(
        'impact needs a token name: stylegraph impact colors.accent [path]',
      );

    const graph = await graphOf(dir);
    const nameOf = (id) => id.split('#').pop();
    // Prefer exact names. Otherwise `colors.accent` silently drags in
    // accentHover, accentSubtle and accentText and reports their union.
    const exact = Object.keys(graph.tokens).filter((id) =>
      parts.some((p) => id === p || nameOf(id) === p),
    );
    const seeds = exact.length
      ? exact
      : Object.keys(graph.tokens).filter((id) =>
          parts.some((p) => nameOf(id).includes(p)),
        );

    if (!seeds.length) {
      console.error(`no token matches ${parts.join(', ')}`);
      return 1;
    }
    if (!exact.length && !args.flags.has('json')) {
      console.log(
        dim(`\n  no exact match; matching by substring on ${seeds.length} token(s)`),
      );
    }
    const r = blastRadius(graph, seeds);
    if (args.flags.has('json')) {
      console.log(JSON.stringify(r, null, 2));
      return 0;
    }
    console.log('');
    console.log(
      `  ${bold('blast radius')}  ${dim(seeds.map((s) => s.split('#').pop()).join(', '))}`,
    );
    console.log('  ' + dim('─'.repeat(58)));
    console.log(
      `  ${r.units.length} units · ${r.files.length} files · ${r.tokens.length} tokens in the closure`,
    );
    console.log('');
    for (const u of r.units) {
      console.log(`  ${u.id}  ${dim(u.via.map((v) => v.split('#').pop()).join(', '))}`);
    }
    console.log('');
    return 0;
  }

  const root = args._[0] ?? '.';

  const overrides = {};
  if (args.exclude.length) overrides.exclude = args.exclude;
  if (args.contrastLevel) overrides.contrast = { level: args.contrastLevel };
  if (args.flags.has('no-contrast')) {
    overrides.contrast = { ...(overrides.contrast ?? {}), enabled: false };
  }
  if (args.flags.has('publishes-tokens')) overrides.publishesTokens = true;

  const config = await loadConfig(root, overrides);
  // A config `exclude` and a CLI `--exclude` should add up, not replace.
  if (args.exclude.length && config.configFile) {
    config.exclude = [...new Set([...(config.exclude ?? []), ...args.exclude])];
  }

  const result = await audit(root, { config });

  if (cmd === 'graph') {
    const g = buildGraph(result, { version: VERSION, adapter: result.adapter });
    const json = JSON.stringify(g, null, 2);
    if (args.out) {
      writeFileSync(args.out, json);
      console.log(`  stylegraph v${g.version} → ${args.out}`);
      console.log(
        dim(
          `  ${g.summary.units} units · ${g.summary.tokens} tokens · ${g.summary.files} files`,
        ),
      );
    } else {
      console.log(json);
    }
    return 0;
  }

  if (cmd === 'explain') {
    const { renderExplain } = await import('../src/report.js');
    console.log(renderExplain());
    console.log(renderRules());
    return 0;
  }

  if (args.flags.has('json')) {
    const { config: _cfg, ...rest } = result;
    console.log(JSON.stringify({ ...rest, configFile: config.configFile }, null, 2));
  } else if (cmd === 'tokens') {
    console.log(renderTokens(result));
  } else if (cmd === 'contrast') {
    console.log(renderContrast(result));
  } else {
    console.log(renderSummary(result, { violations: args.flags.has('violations') }));
  }

  // Gate
  const gate = args.gate ?? (config.threshold != null ? config.threshold * 100 : null);
  if (gate == null) return 0;

  const pct = (result.score ?? 1) * 100;
  // Every theme counts, not only the default one.
  const contrastFails = (result.contrastFailing ?? result.contrast.failing).length;

  if (pct + 1e-9 < gate) {
    if (!args.flags.has('json')) {
      console.log(red(`  ✗ conformance ${pct.toFixed(1)}% is below the ${gate}% gate`));
      console.log(
        dim(
          `    ${result.literal} literal${result.literal === 1 ? '' : 's'} to fix. Run with --violations to list them.`,
        ),
      );
      console.log('');
    }
    return 1;
  }
  if (contrastFails) {
    if (!args.flags.has('json')) {
      console.log(
        red(
          `  ✗ ${contrastFails} contrast failure${contrastFails === 1 ? '' : 's'} on real pairings`,
        ),
      );
      console.log('');
    }
    return 2;
  }
  if (!args.flags.has('json')) {
    console.log(green(`  ✓ conformance gate passed`));
    console.log('');
  }
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(`stylegraph: ${err.message}`);
    if (process.env.ASSAY_DEBUG) console.error(err.stack);
    process.exit(1);
  },
);
