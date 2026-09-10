/**
 * A stylegraph becomes a DTCG document.
 *
 * The thing that makes this worth doing rather than dumping values: **an alias
 * stays an alias.** A semantic token that points at a primitive is the design
 * system's structure, and flattening it to a hex string throws that structure
 * away — the receiving tool then shows forty unrelated colours instead of a
 * ramp and four roles that reference it.
 */
import { classify, toValue } from './values.js';

/** `tokens/color.stylex.ts#colors.accent` → `['colors', 'accent']` */
function pathOf(tokenId) {
  const name = tokenId.split('#')[1] ?? tokenId;
  return name.split('.');
}

/** DTCG references a token by its path in the document: `{colors.accent}`. */
const aliasFor = (tokenId) => `{${pathOf(tokenId).join('.')}}`;

function setDeep(root, path, value) {
  let node = root;
  for (const key of path.slice(0, -1)) {
    if (!node[key] || typeof node[key] !== 'object') node[key] = {};
    node = node[key];
  }
  node[path[path.length - 1]] = value;
}

/**
 * Hoist a `$type` shared by every token in a group onto the group.
 *
 * The spec allows `$type` to be inherited, and a document that repeats
 * `"$type": "color"` on ninety leaves is one a person will not read.
 */
function hoistTypes(node) {
  if (!node || typeof node !== 'object' || node.$value !== undefined) return null;

  const childTypes = [];
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    childTypes.push(
      child.$value !== undefined ? (child.$type ?? null) : hoistTypes(child),
    );
  }

  if (childTypes.length === 0 || childTypes.some((t) => t === null)) return null;
  const [first] = childTypes;
  if (!childTypes.every((t) => t === first)) return null;

  node.$type = first;
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    delete child.$type;
  }
  return first;
}

/**
 * @param graph a stylegraph
 * @returns {{ document, lossy }} the DTCG document, and everything that could
 *   not be carried — reported rather than dropped quietly.
 */
export function toDTCG(graph, opts = {}) {
  const document = {};
  const lossy = [];

  const tokens = Object.values(graph.tokens ?? {});
  const byId = new Map(tokens.map((t) => [t.id, t]));

  for (const token of tokens) {
    const path = pathOf(token.id);

    // An alias: this token is exactly one other token.
    const [ref] = token.refs ?? [];

    if (ref && byId.has(ref) && isAliasExpression(token.raw, ref)) {
      const target = byId.get(ref);
      const type = target.value != null ? classify(target.value) : null;
      const entry = { $value: aliasFor(ref) };
      if (type) entry.$type = type;
      setDeep(document, path, entry);
      continue;
    }

    if (token.value == null) {
      lossy.push({
        token: token.id,
        reason: 'value could not be resolved at build time',
      });
      continue;
    }

    const type = classify(token.value);
    if (!type) {
      // Shadows, gradients and multi-part values are composite DTCG types that
      // a flat CSS string cannot be turned into without guessing.
      lossy.push({
        token: token.id,
        value: token.value,
        reason: 'no DTCG type carries this value',
      });
      continue;
    }

    const $value = toValue(type, token.value);
    if ($value === null) {
      lossy.push({
        token: token.id,
        value: token.value,
        reason: `could not encode as ${type}`,
      });
      continue;
    }

    setDeep(document, path, { $value, $type: type });
  }

  for (const key of Object.keys(document)) hoistTypes(document[key]);

  if (opts.description) document.$description = opts.description;

  return { document, lossy };
}

/**
 * Is `raw` just a reference to `ref`, or an expression that merely mentions it?
 * `palette.violet500` is an alias; `` `1px solid ${palette.ink}` `` is not, and
 * calling it one would lose everything around the reference.
 */
function isAliasExpression(raw, ref) {
  if (typeof raw !== 'string') return false;
  const name = (ref.split('#')[1] ?? '').split('.').slice(-1)[0];
  const trimmed = raw.trim();
  if (!name) return false;
  // `palette.violet500` or `palette['violet500']`
  return (
    /^[A-Za-z_$][\w$]*(\.[\w$-]+|\[['"][^'"]+['"]\])+$/.test(trimmed) &&
    trimmed.endsWith(name)
  );
}
