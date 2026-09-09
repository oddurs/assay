/**
 * The taxonomy. Every judgement Assay makes about a declaration is defined
 * here, and every violation it reports names the rule that fired.
 *
 * This file is the product. The AST walking is the easy half — what counts as
 * "conformant" is the part that has to be defensible, auditable, and
 * overridable, because a score nobody trusts is worse than no score.
 */

/**
 * Token-bearing property families.
 *
 * The denominator is NOT every declaration. `display: 'flex'` cannot carry a
 * design token, so counting it as a violation would make the score meaningless.
 * A property is scored only if it belongs to a family below.
 */
export const FAMILIES = [
  {
    id: 'color',
    rule: 'no-raw-color',
    match: /color$/i,
    also: /^(fill|stroke|floodColor|stopColor)$/,
    why: 'Colour is the most theme-sensitive value in a system; a literal here defeats every theme.',
  },
  {
    id: 'space',
    rule: 'no-raw-space',
    match: /^(padding|margin)([A-Z]|$)/,
    also: /^(gap|rowGap|columnGap|inset|top|right|bottom|left)([A-Z]|$)/,
    why: 'Spacing literals are how rhythm drifts — each one is individually defensible and collectively fatal.',
  },
  {
    id: 'radius',
    rule: 'no-raw-radius',
    match: /Radius$|^borderRadius$/,
    why: 'Corner radius is a brand signature; mixed values read as different products.',
  },
  {
    id: 'border',
    rule: 'no-raw-border-width',
    match: /^(border|outline|column)([A-Z][A-Za-z]*)?Width$|^strokeWidth$/,
    why: 'Hairline widths need to move together when density changes.',
  },
  {
    id: 'type',
    rule: 'no-raw-type',
    match: /^(fontSize|fontFamily|fontWeight|lineHeight|letterSpacing)$/,
    why: 'A type scale only exists if nothing steps outside it.',
  },
  {
    id: 'shadow',
    rule: 'no-raw-shadow',
    match: /^(boxShadow|textShadow)$/,
    why: 'Elevation is a system with levels, not a per-component invention.',
  },
  {
    id: 'motion',
    rule: 'no-raw-motion',
    match: /^(transition|animation)(Duration|Delay|TimingFunction)$/,
    why: 'Inconsistent durations are felt before they are seen.',
  },
  {
    id: 'layer',
    rule: 'no-raw-z-index',
    match: /^zIndex$/,
    why: 'Ad-hoc z-index is the classic unownable bug.',
  },
];

/** Values that need no token: absences, resets, and CSS-wide keywords. */
export const NEUTRAL_VALUES = new Set([
  'inherit', 'initial', 'unset', 'revert', 'revert-layer',
  'auto', 'none', 'normal', 'transparent', 'currentColor', 'currentcolor',
  '0', 'fit-content', 'max-content', 'min-content',
]);

/**
 * Layout geometry, not design values. `top: '50%'` is not a missing token —
 * percentages, viewport units, fractions and calc() describe position and
 * proportion, which no design system tokenizes.
 */
export const GEOMETRY = /^-?\d*\.?\d+(%|v[hwib]|vmin|vmax|fr)$|^(calc|min|max|clamp)\(/;

/** Outcomes. Only TOKEN and LITERAL move the number. */
export const CAT = {
  TOKEN: 'token',
  LITERAL: 'literal',
  DYNAMIC: 'dynamic',
  CSSVAR: 'cssvar',
  EXPR: 'expr',
  NEUTRAL: 'neutral',
};

export const CAT_DOC = {
  token: 'Resolves to a *.stylex module export. The numerator.',
  literal: 'A hardcoded design value in a token-bearing family. The violation.',
  dynamic:
    'Depends on a runtime parameter, so StyleX compiles it to a CSS custom property. Genuinely unknowable at build time — never counted as a pass OR a violation.',
  cssvar: 'A raw var(--x) reference. Excluded: it is a variable, just not one we can trace.',
  expr: 'An expression we could not resolve. Excluded, and reported so the blind spot is visible.',
  neutral: 'A keyword, zero, null, or layout geometry. Needs no token.',
};

/** Build the family lookup, honouring config that disables families. */
export function buildFamilies(disabled = []) {
  const off = new Set(disabled);
  return FAMILIES.filter((f) => !off.has(f.id));
}

export function familyOf(prop, families) {
  for (const f of families) {
    if (f.match.test(prop)) return f;
    if (f.also && f.also.test(prop)) return f;
  }
  return null;
}
