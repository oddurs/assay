/**
 * Variants for StyleX.
 *
 * Every design system needs size, tone and state APIs, and StyleX has no
 * equivalent of the runtime variant libraries — so teams hand-roll conditional
 * style arrays, which the analyser reads as ordinary declarations. The fact
 * that `sizeSm` and `sizeMd` are two values of one axis on one component is
 * lost, and nothing downstream can recover it.
 *
 * This is the only package in the family that enters a production bundle, so
 * it has rules the others do not: zero runtime dependencies, and a size budget
 * enforced by `scripts/task check`.
 *
 *   const button = defineVariants({
 *     base: styles.base,
 *     variants: {
 *       size: { sm: styles.sizeSm, md: styles.sizeMd },
 *       tone: { quiet: styles.quiet, loud: styles.loud },
 *     },
 *     defaultVariants: { size: 'md', tone: 'quiet' },
 *   });
 *
 *   <button {...stylex.props(button({ size: 'sm' }))} />
 */

/**
 * Order is the contract, because StyleX merges by application order and the
 * last style wins:
 *
 *   base → variants → compound → the caller's own overrides
 *
 * A component that cannot be overridden by its caller is a component people
 * fork. Putting `style` last is what makes that unnecessary.
 */
export function defineVariants(config) {
  const {
    base = null,
    variants = {},
    defaultVariants = {},
    compoundVariants = [],
  } = config ?? {};

  const axes = Object.keys(variants);

  return function resolve(props) {
    const selection = props ?? {};
    const out = [];

    if (base) out.push(base);

    // `undefined` falls back to the default; `null` opts out of the axis
    // entirely, which is how a caller says "no size" rather than "the default".
    const chosen = {};
    for (const axis of axes) {
      const value =
        selection[axis] === undefined ? defaultVariants[axis] : selection[axis];
      if (value === null || value === undefined) continue;
      chosen[axis] = value;
      const style = variants[axis][value];
      if (style !== undefined) out.push(style);
    }

    for (const rule of compoundVariants) {
      const { style, ...match } = rule;
      const applies = Object.keys(match).every((axis) => chosen[axis] === match[axis]);
      if (applies && style !== undefined) out.push(style);
    }

    // The caller's overrides go last so they actually win.
    if (selection.style !== undefined) out.push(selection.style);

    return out;
  };
}

/**
 * The axes and values a variant function accepts, for tooling that wants to
 * enumerate them — a docs page, a Storybook control, an agent asking what a
 * component can do.
 */
export function describeVariants(config) {
  const { variants = {}, defaultVariants = {} } = config ?? {};
  return Object.keys(variants).map((axis) => ({
    axis,
    values: Object.keys(variants[axis]),
    default: defaultVariants[axis] ?? null,
  }));
}
