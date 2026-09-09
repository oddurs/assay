import * as stylex from '@stylexjs/stylex';

/**
 * LAYER 1 — PRIMITIVES
 *
 * Raw scale values. `defineConsts` compiles these away entirely: they are
 * inlined at build time, cost nothing at runtime, and are deliberately NOT
 * themeable. A theme swaps semantic meaning, never the underlying scale.
 *
 * This is the ONLY file in the project where a raw literal is legal.
 * `npm run check` fails the build if a literal appears anywhere else.
 */

export const palette = stylex.defineConsts({
  // Neutral ramp — blue-biased, so the dark ground reads cold rather than muddy
  ink000: '#04060A',
  ink050: '#080B12',
  ink100: '#0D111A',
  ink150: '#121722',
  ink200: '#171D2A',
  ink300: '#1F2735',
  ink400: '#2A3444',
  ink500: '#3B4759',
  ink600: '#586579',
  ink700: '#8590A3',
  ink800: '#B4BDCC',
  ink900: '#E4E9F1',
  ink950: '#FFFFFF',

  // Signal — plotter rose, carried over from the Assay report identity
  rose300: '#FFB3CF',
  rose400: '#FF7FAE',
  rose500: '#F5468C',
  rose600: '#D81E6D',

  // Accent — the interactive hue
  violet300: '#BFB2FF',
  violet400: '#9C87FF',
  violet500: '#7350F5',
  violet600: '#5F3AE8',

  // Support
  teal400: '#52E5D0',
  teal500: '#1FC9B2',
  amber400: '#F7B84B',
  amber500: '#D9922A',
  red400: '#FF7A70',
  red500: '#E8483C',
  green400: '#5FD98C',
  green500: '#27B865',
});

export const scale = stylex.defineConsts({
  // 4px base, doubling at the top for section rhythm
  s0: '0px',
  s1: '2px',
  s2: '4px',
  s3: '8px',
  s4: '12px',
  s5: '16px',
  s6: '24px',
  s7: '32px',
  s8: '48px',
  s9: '64px',
  s10: '96px',
  s11: '128px',
  s12: '176px',
});

export const size = stylex.defineConsts({
  // Modular type scale, 1.2 minor third, tuned by hand at the display end
  t0: '11px',
  t1: '12px',
  t2: '13px',
  t3: '15px',
  t4: '17px',
  t5: '20px',
  t6: '25px',
  t7: '32px',
  t8: '42px',
  t9: '56px',
  t10: '72px',
});

export const font = stylex.defineConsts({
  sans: 'Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
});

export const curve = stylex.defineConsts({
  // A single easing family. Standard for most things, spring for entrances.
  standard: 'cubic-bezier(0.32, 0.72, 0, 1)',
  entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
  linear: 'linear',
});
