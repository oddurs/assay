/**
 * Running a suite under every theme.
 *
 * Themes are where design systems break, and almost nothing tests them. This
 * project's own site shipped three themes carrying contrast failures that a
 * base-theme-only check reported as passing.
 */
import { findToken, indexGraph, tokenName } from './resolve.js';

/**
 * Every theme in the graph, plus the base, as the token values each produces.
 *
 * One entry per `createTheme` call, because that is what the graph knows. A
 * theme in an app is often several of those applied together — colour, radius
 * and elevation — but nothing in the source says which ones travel as a set,
 * so `bundles` is where a suite says so. See `forEachTheme`.
 *
 * The base is included deliberately: a suite that ran only the alternates
 * would stop testing the theme most people see.
 */
export function themesOf(graph, bundles) {
  const baseValues = Object.fromEntries(
    Object.values(graph.tokens ?? {}).map((t) => [t.id, t.value]),
  );
  const base = { name: 'base', values: baseValues };
  const themes = Object.values(graph.themes ?? {});

  if (!bundles) {
    return [
      base,
      ...themes.map((theme) => ({
        name: theme.name,
        group: theme.group,
        values: { ...baseValues, ...theme.overrides },
      })),
    ];
  }

  const byName = new Map(themes.map((t) => [t.name, t]));
  const bundled = Object.entries(bundles).map(([name, members]) => {
    const values = { ...baseValues };
    for (const member of [].concat(members)) {
      const theme = byName.get(member);
      // A name that matches nothing is a typo or a deleted theme, and either
      // way silently testing the base under that theme's name is the failure
      // this package exists to prevent.
      if (!theme) {
        throw new Error(
          `bundle "${name}" names theme "${member}", which is not in the graph. ` +
            `Known themes: ${[...byName.keys()].join(', ')}`,
        );
      }
      Object.assign(values, theme.overrides);
    }
    return { name, members: [].concat(members), values };
  });

  return [base, ...bundled];
}

/**
 * Run `fn` once per theme.
 *
 *   forEachTheme(graph, ({ name, valueOf }) => {
 *     it(`reads on ${name}`, () => { ... valueOf('colors.accent') ... });
 *   });
 *
 * `only` narrows to named themes, for a test that is genuinely about one.
 * `bundles` names the sets a theme is actually applied in, and replaces the
 * one-per-`createTheme` default:
 *
 *   forEachTheme(graph, fn, {
 *     bundles: { bone: ['boneColors', 'boneShape', 'boneElevation'] },
 *   });
 *
 * Without it, a suite asserting on colour runs once per non-colour theme too,
 * re-testing the base value under a name that implies otherwise.
 */
export function forEachTheme(graph, fn, opts = {}) {
  const index = indexGraph(graph);
  const wanted = opts.only ? new Set([].concat(opts.only)) : null;

  for (const theme of themesOf(graph, opts.bundles)) {
    if (wanted && !wanted.has(theme.name)) continue;

    const valueOf = (name) => {
      const token = findToken(index, name);
      return token ? (theme.values[token.id] ?? null) : null;
    };

    fn({ ...theme, valueOf, tokenName });
  }
}
