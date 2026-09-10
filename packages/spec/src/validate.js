/**
 * Conformance for stylegraph v1.
 *
 * The spec claims a second producer can be written from the document alone.
 * That is a claim until something can check the result, so this is the thing
 * that checks it — and it lives in `spec` rather than in a tool, because a
 * producer should be able to run it without adopting any of our tooling.
 *
 * Every failure names the exact path it was found at. "invalid graph" tells a
 * producer author nothing; `units["a.tsx#b"].declarations[2].cat` tells them
 * where to look.
 */
import { GRAPH_VERSION, hashOf } from './graph.js';

const CATEGORIES = new Set([
  'token',
  'literal',
  'dynamic',
  'neutral',
  'cssvar',
  'expr',
]);
const HASH = /^[0-9a-f]{16}$/;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isString = (v) => typeof v === 'string';

/**
 * An id is `<path>#<name>`, and the path is relative to the analysed root.
 * An absolute path means the producer leaked the machine it ran on, which is
 * exactly what makes two graphs of the same commit fail to compare.
 */
function checkId(id, where, errors) {
  if (!isString(id) || id.length === 0) {
    errors.push({ path: where, message: 'id must be a non-empty string' });
    return;
  }
  if (!id.includes('#')) {
    errors.push({ path: where, message: `id must be "<path>#<name>", got "${id}"` });
    return;
  }
  const [file] = id.split('#');
  if (file.startsWith('/') || /^[A-Za-z]:[\\/]/.test(file)) {
    errors.push({
      path: where,
      message: `id must be relative to the analysed root, got absolute "${file}"`,
    });
  }
  if (file.includes('\\')) {
    errors.push({ path: where, message: `id must use "/" separators, got "${file}"` });
  }
}

function checkDeclaration(d, where, errors) {
  if (!isObject(d)) {
    errors.push({ path: where, message: 'declaration must be an object' });
    return;
  }
  for (const field of ['prop', 'cond', 'cat']) {
    if (!isString(d[field])) {
      errors.push({ path: `${where}.${field}`, message: `${field} must be a string` });
    }
  }
  if (isString(d.cat) && !CATEGORIES.has(d.cat)) {
    errors.push({
      path: `${where}.cat`,
      message: `unknown category "${d.cat}"; expected one of ${[...CATEGORIES].join(', ')}`,
    });
  }
  // A producer that cannot classify a value must say `expr`. Emitting `token`
  // without naming the token is the failure the format exists to prevent.
  if (d.cat === 'token' && !isString(d.token)) {
    errors.push({
      path: `${where}.token`,
      message: 'a token declaration must name its token',
    });
  }
  if (d.cat === 'literal' && d.value === undefined) {
    errors.push({
      path: `${where}.value`,
      message: 'a literal declaration must carry its value',
    });
  }
}

function checkToken(token, key, errors) {
  const where = `tokens[${JSON.stringify(key)}]`;
  if (!isObject(token)) {
    errors.push({ path: where, message: 'token must be an object' });
    return;
  }
  checkId(token.id, `${where}.id`, errors);
  if (token.id !== key) {
    errors.push({
      path: `${where}.id`,
      message: `id "${token.id}" does not match its key`,
    });
  }
  if (!isString(token.name))
    errors.push({ path: `${where}.name`, message: 'name must be a string' });
  if (token.value !== null && !isString(token.value)) {
    errors.push({
      path: `${where}.value`,
      message: 'value must be a string, or null when it cannot be resolved',
    });
  }
  if (!Array.isArray(token.refs)) {
    errors.push({ path: `${where}.refs`, message: 'refs must be an array' });
  } else {
    token.refs.forEach((r, i) => checkId(r, `${where}.refs[${i}]`, errors));
  }
}

function checkUnit(unit, key, errors) {
  const where = `units[${JSON.stringify(key)}]`;
  if (!isObject(unit)) {
    errors.push({ path: where, message: 'unit must be an object' });
    return;
  }
  checkId(unit.id, `${where}.id`, errors);
  if (unit.id !== key) {
    errors.push({
      path: `${where}.id`,
      message: `id "${unit.id}" does not match its key`,
    });
  }
  if (!Array.isArray(unit.declarations)) {
    errors.push({
      path: `${where}.declarations`,
      message: 'declarations must be an array',
    });
    return;
  }
  unit.declarations.forEach((d, i) =>
    checkDeclaration(d, `${where}.declarations[${i}]`, errors),
  );

  // `(prop, cond)` is unique within a unit: two values for one property in one
  // state is not a graph of what rendered, it is a graph of what was written.
  const seen = new Set();
  for (const d of unit.declarations) {
    const k = `${d?.prop}@${d?.cond}`;
    if (seen.has(k)) {
      errors.push({
        path: `${where}.declarations`,
        message: `duplicate declaration for ${k}; (prop, cond) must be unique within a unit`,
      });
    }
    seen.add(k);
  }

  if (!HASH.test(unit.hash ?? '')) {
    errors.push({
      path: `${where}.hash`,
      message: 'hash must be 16 lowercase hex characters',
    });
  } else {
    // The agreement that makes a diff a hash comparison. Two producers that
    // disagree here produce graphs that cannot be compared at all.
    const expected = hashOf(unit.declarations);
    if (expected !== unit.hash) {
      errors.push({
        path: `${where}.hash`,
        message: `hash does not match its declarations (expected ${expected}, got ${unit.hash})`,
      });
    }
  }
}

/**
 * Validate a graph against stylegraph v1.
 * Returns every problem found, not just the first — a producer author fixing
 * one error at a time is a producer author who gives up.
 */
export function validateGraph(graph) {
  const errors = [];

  if (!isObject(graph)) {
    return { ok: false, errors: [{ path: '', message: 'graph must be an object' }] };
  }

  if (graph.version !== GRAPH_VERSION) {
    return {
      ok: false,
      errors: [
        {
          path: 'version',
          message: `stylegraph v${graph.version}; this build reads v${GRAPH_VERSION}`,
        },
      ],
    };
  }

  if (!isObject(graph.generator)) {
    errors.push({ path: 'generator', message: 'generator must be an object' });
  } else if (!isString(graph.generator.name)) {
    errors.push({ path: 'generator.name', message: 'generator.name must be a string' });
  }

  for (const field of ['tokens', 'units', 'summary']) {
    if (!isObject(graph[field])) {
      errors.push({ path: field, message: `${field} must be an object` });
    }
  }
  if (errors.length) return { ok: false, errors };

  for (const [key, token] of Object.entries(graph.tokens))
    checkToken(token, key, errors);
  for (const [key, unit] of Object.entries(graph.units)) checkUnit(unit, key, errors);

  // A declaration naming a token that does not exist is a dangling edge, and
  // blast radius computed over it silently under-reports.
  for (const [key, unit] of Object.entries(graph.units)) {
    for (const [i, d] of (unit.declarations ?? []).entries()) {
      if (d?.cat === 'token' && isString(d.token) && !graph.tokens[d.token]) {
        errors.push({
          path: `units[${JSON.stringify(key)}].declarations[${i}].token`,
          message: `references "${d.token}", which is not in tokens`,
        });
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/** A one-line summary, for a CLI or a CI log. */
export function formatErrors(errors) {
  return errors.map((e) => (e.path ? `${e.path}: ${e.message}` : e.message)).join('\n');
}
