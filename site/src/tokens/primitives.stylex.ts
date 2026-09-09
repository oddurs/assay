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
  ink600: '#747F90',
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

/**
 * Translucency. A glass surface cannot be built from the opaque ink ramp — it
 * needs alpha, and alpha is a raw value, so it belongs in layer 1 with
 * everything else literal.
 */
export const film = stylex.defineConsts({
  light02: 'rgba(255, 255, 255, 0.02)',
  light04: 'rgba(255, 255, 255, 0.04)',
  light06: 'rgba(255, 255, 255, 0.06)',
  light10: 'rgba(255, 255, 255, 0.10)',
  light16: 'rgba(255, 255, 255, 0.16)',
  dark04: 'rgba(4, 6, 10, 0.04)',
  dark40: 'rgba(4, 6, 10, 0.40)',
  dark60: 'rgba(4, 6, 10, 0.60)',
  dark80: 'rgba(4, 6, 10, 0.80)',
});

export const blurLength = stylex.defineConsts({
  none: '0px',
  glass: '14px',
  veil: '32px',
  ambient: '90px',
});

/**
 * Curated theme ramps.
 *
 * Each of these is a distinct material, not a hue rotation of the last one. A
 * theme built by spinning the same saturated accent around the wheel produces
 * four versions of one design; these are four different rooms.
 */
export const warm = stylex.defineConsts({
  // Graphite with a brown bias — reads as machined metal, not as "dark grey"
  w000: '#0A0908', w050: '#12100E', w100: '#1A1714', w150: '#221E1A',
  w200: '#2A2521', w300: '#37312B', w400: '#4A423A', w500: '#635A50',
  w600: '#8B8175', w700: '#A79B8D', w800: '#CFC5B8', w900: '#EDE6DC',
  w950: '#FFFDF9',
  amber300: '#FCD08A', amber400: '#F0A93C', amber500: '#C77F1B', amber600: '#A36816',
});

export const sea = stylex.defineConsts({
  // Deep sea green, the ground oxidised copper sits on
  s000: '#04100D', s050: '#071813', s100: '#0B211B', s150: '#0F2A22',
  s200: '#14342B', s300: '#1C4739', s400: '#265C4A', s500: '#377963',
  s600: '#549A80', s700: '#87BBA6', s800: '#BCDBCD', s900: '#E4F1EA',
  patina400: '#5FD6B2', patina500: '#2FB891',
  copper400: '#E39A72', copper500: '#C87A4C',
});

export const bone = stylex.defineConsts({
  // Warm paper and printer's ink
  p000: '#FFFFFF', p050: '#FBF8F2', p100: '#F5F1E8', p200: '#EBE5D9',
  p300: '#DCD4C4', p400: '#BFB5A2', p500: '#7D7465', p600: '#5F574B',
  p700: '#3D372F', p800: '#241F1A', p900: '#14100C',
  ox400: '#C2485A', ox500: '#9B2C3A', indigo500: '#3B3A8C',
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
  // The structural grid rhythm. Every hairline field steps on this.
  cell: '72px',
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
