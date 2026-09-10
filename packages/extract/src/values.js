/**
 * Resolving a token to a concrete value.
 *
 * This is extraction, not judgement: the graph format requires every token to
 * carry its resolved value, so the producer has to do this. Contrast — which
 * decides whether two resolved values are acceptable together — lives in audit.
 */
/* ------------------------ token value resolution ------------------------ */

/**
 * Resolve a token id to a concrete colour string by following the chain
 * through defineVars -> defineConsts. Conditional objects resolve to their
 * `default` branch, which is what renders unless a media query overrides it.
 */
export function makeResolver(tokens, overrides = null) {
  const cache = new Map();

  function valueOfNode(node, def, depth) {
    if (!node || depth > 12) return null;

    switch (node.type) {
      case 'StringLiteral':
        return node.value;
      case 'NumericLiteral':
        return String(node.value);
      case 'TemplateLiteral':
        if (node.expressions.length === 0) {
          return node.quasis.map((q) => q.value.cooked).join('');
        }
        return null;
      case 'ObjectExpression': {
        // conditional: take `default`
        for (const p of node.properties) {
          if (p.type !== 'ObjectProperty') continue;
          const k =
            !p.computed && p.key.type === 'Identifier'
              ? p.key.name
              : p.key.type === 'StringLiteral'
                ? p.key.value
                : null;
          if (k === 'default') return valueOfNode(p.value, def, depth + 1);
        }
        return null;
      }
      case 'MemberExpression': {
        const id = def.resolveRef ? def.resolveRef(node) : null;
        if (!id) return null;
        return resolve(id, depth + 1);
      }
      default:
        return null;
    }
  }

  function resolve(id, depth = 0) {
    if (cache.has(id)) return cache.get(id);
    if (depth > 12) return null;
    // A theme's override replaces the base definition for that token; the
    // chain below it still resolves normally.
    const tok = (overrides && overrides.get(id)) || tokens.get(id);
    if (!tok) return null;
    cache.set(id, null); // cycle guard
    const v = valueOfNode(tok.value, tok, depth);
    cache.set(id, v);
    return v;
  }

  return resolve;
}
