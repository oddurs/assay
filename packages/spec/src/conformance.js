/**
 * The conformance suite for stylegraph v1.
 *
 * Exported so a producer for another styling system can run it against its own
 * output without adopting any of this project's tooling:
 *
 *   import { runConformance } from '@stylegraph/spec';
 *   const { ok, failures } = runConformance(myGraph);
 *
 * Each case mutates a known-good graph in exactly one way and asserts that the
 * validator rejects it, naming the field. A validator that returns "invalid" is
 * useless to whoever has to fix the producer.
 */
import { validateGraph } from './validate.js';

const clone = (g) => JSON.parse(JSON.stringify(g));
const firstUnitKey = (g) => Object.keys(g.units)[0];
const firstTokenKey = (g) => Object.keys(g.tokens)[0];

/**
 * Each case: mutate one thing, and name the path the error must point at.
 * `path` is a substring match, so a producer is free to add detail.
 */
export const CASES = [
  {
    name: 'a version this build cannot read',
    path: 'version',
    mutate: (g) => {
      g.version = 99;
    },
  },
  {
    name: 'a missing top-level section',
    path: 'tokens',
    mutate: (g) => {
      delete g.tokens;
    },
  },
  {
    name: 'an absolute path in an id',
    path: '.id',
    mutate: (g) => {
      const k = firstUnitKey(g);
      g.units[k].id = '/Users/someone/project/' + k;
    },
  },
  {
    name: 'a windows separator in an id',
    path: '.id',
    mutate: (g) => {
      // Constructed rather than derived: a flat fixture has no separator to
      // replace, and a case that quietly mutates nothing always passes.
      const k = firstUnitKey(g);
      g.units[k].id = 'src\\components\\Card.tsx#card';
    },
  },
  {
    name: 'an id that disagrees with its key',
    path: '.id',
    mutate: (g) => {
      g.units[firstUnitKey(g)].id = 'somewhere-else.tsx#other';
    },
  },
  {
    name: 'an unknown declaration category',
    path: '.cat',
    mutate: (g) => {
      g.units[firstUnitKey(g)].declarations[0].cat = 'probably';
    },
  },
  {
    name: 'a token declaration that names no token',
    path: '.token',
    mutate: (g) => {
      const u = g.units[firstUnitKey(g)];
      const d = u.declarations.find((x) => x.cat === 'token') ?? u.declarations[0];
      d.cat = 'token';
      delete d.token;
    },
  },
  {
    name: 'a literal declaration carrying no value',
    path: '.value',
    mutate: (g) => {
      const u = g.units[firstUnitKey(g)];
      const d = u.declarations.find((x) => x.cat === 'literal') ?? u.declarations[0];
      d.cat = 'literal';
      delete d.value;
    },
  },
  {
    name: 'two declarations for one property in one state',
    path: '.declarations',
    mutate: (g) => {
      const u = g.units[firstUnitKey(g)];
      u.declarations.push(JSON.parse(JSON.stringify(u.declarations[0])));
    },
  },
  {
    name: 'a hash that does not match its declarations',
    path: '.hash',
    mutate: (g) => {
      g.units[firstUnitKey(g)].hash = '0'.repeat(16);
    },
  },
  {
    name: 'a hash that is not a hash',
    path: '.hash',
    mutate: (g) => {
      g.units[firstUnitKey(g)].hash = 'not-a-hash';
    },
  },
  {
    name: 'a declaration referencing a token that does not exist',
    path: '.token',
    mutate: (g) => {
      const u = g.units[firstUnitKey(g)];
      const d = u.declarations.find((x) => x.cat === 'token');
      if (d) d.token = 'nowhere.stylex.ts#missing.value';
      else {
        u.declarations[0].cat = 'token';
        u.declarations[0].token = 'nowhere#x';
      }
    },
  },
  {
    name: 'a token value that is neither a string nor null',
    path: '.value',
    mutate: (g) => {
      g.tokens[firstTokenKey(g)].value = 42;
    },
  },
  {
    name: 'token refs that are not an array',
    path: '.refs',
    mutate: (g) => {
      g.tokens[firstTokenKey(g)].refs = 'none';
    },
  },
];

/**
 * Run the suite against a graph the producer says is valid.
 * Returns every failure, so a producer author sees the whole picture at once.
 */
export function runConformance(graph) {
  const failures = [];

  const base = validateGraph(graph);
  if (!base.ok) {
    failures.push({
      case: 'the graph itself is valid',
      reason: 'the supplied graph does not validate',
      errors: base.errors,
    });
    // Every mutation case starts from this graph, so there is nothing further
    // to learn until it validates.
    return { ok: false, ran: 1, failures };
  }

  for (const c of CASES) {
    const mutated = clone(graph);
    c.mutate(mutated);
    const result = validateGraph(mutated);

    if (result.ok) {
      failures.push({ case: c.name, reason: 'was accepted, and must be rejected' });
      continue;
    }
    // Rejection is not enough: the error has to point at the field, or a
    // producer author cannot act on it.
    if (!result.errors.some((e) => e.path.includes(c.path))) {
      failures.push({
        case: c.name,
        reason: `rejected, but no error named "${c.path}"`,
        errors: result.errors,
      });
    }
  }

  return { ok: failures.length === 0, ran: CASES.length + 1, failures };
}
