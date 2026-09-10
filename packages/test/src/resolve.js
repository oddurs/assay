/**
 * Turning what a component compiled to back into what it meant.
 *
 * StyleX compiles a declaration to an atomic class name — `x1e2nbdu`. That
 * name is an implementation detail that changes between compiler versions, so
 * a test written against it churns; and in a snapshot it tells a reviewer
 * nothing at all. The graph knows what those classes encode, so assertions can
 * be made against declarations and tokens instead.
 */

/** An index built once per graph and reused by every matcher. */
export function indexGraph(graph) {
  const units = new Map();
  const tokensByName = new Map();
  const tokensById = new Map();

  for (const token of Object.values(graph.tokens ?? {})) {
    tokensById.set(token.id, token);

    // Three ways a person might name the same token, most specific first:
    //   colors.accent   the qualified name, which is what people actually write
    //   accent          the name within its group
    //   the full id     path and all
    // `name` in the graph is the path INSIDE the defineVars call, so the
    // qualified form has to come from the id or `colors.accent` finds nothing.
    const qualified = tokenName(token.id);
    tokensByName.set(qualified, token);
    if (!tokensByName.has(token.name)) tokensByName.set(token.name, token);
    const short = qualified.split('.').slice(-1)[0];
    if (!tokensByName.has(short)) tokensByName.set(short, token);
  }

  for (const unit of Object.values(graph.units ?? {})) {
    units.set(unit.id, unit);
    // Findable by bare name too, so a test can say `primary` rather than
    // repeat a file path that will eventually move.
    if (!units.has(unit.name)) units.set(unit.name, unit);
  }

  return { graph, units, tokensByName, tokensById };
}

export function findUnit(index, name) {
  const unit = index.units.get(name);
  if (unit) return unit;

  // `Button#primary` without the extension, or any unambiguous suffix.
  const matches = [...index.units.values()].filter(
    (u) => u.id.endsWith(name) || `${u.file}#${u.name}`.includes(name),
  );
  const unique = new Map(matches.map((m) => [m.id, m]));
  return unique.size === 1 ? [...unique.values()][0] : null;
}

export function findToken(index, name) {
  return index.tokensByName.get(name) ?? index.tokensById.get(name) ?? null;
}

/** `tokens/color.stylex.ts#colors.accent` → `colors.accent` */
export function tokenName(tokenId) {
  return typeof tokenId === 'string'
    ? (tokenId.split('#')[1] ?? tokenId)
    : String(tokenId);
}

/**
 * A unit's declarations as a plain object a person can read:
 *
 *   { backgroundColor: 'colors.accent', 'padding@:hover': '8px' }
 */
export function readable(unit) {
  const out = {};
  for (const d of unit?.declarations ?? []) {
    const key = d.cond && d.cond !== 'default' ? `${d.prop}@${d.cond}` : d.prop;
    if (d.cat === 'token') out[key] = tokenName(d.token);
    else if (d.cat === 'literal') out[key] = d.value;
    // A runtime value is genuinely unknowable; saying so beats inventing one.
    else out[key] = `<${d.cat}>`;
  }
  return out;
}

/** Every token a unit uses, by readable name. */
export function tokensUsed(unit) {
  return (unit?.tokens ?? []).map(tokenName);
}
