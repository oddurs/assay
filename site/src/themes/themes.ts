import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { palette, film } from '../tokens/primitives.stylex';

/**
 * LAYER 3 — THEMES
 *
 * Each of these is a complete re-skin of the entire site. No component knows
 * a theme exists; they reference roles, and a theme redefines what the roles
 * point at. `daylight` inverts the whole surface stack from one object —
 * which is only possible because Layer 2 never named a hue.
 */

export const ember = stylex.createTheme(colors, {
  accent: palette.rose600,
  accentHover: palette.rose600,
  accentText: palette.rose400,
  accentSubtle: palette.rose600,
  signal: palette.amber400,
  signalBright: palette.amber400,
  borderFocus: palette.rose400,
  gradientWarm: palette.amber500,
  gradientFrom: palette.amber400,
  gradientVia: palette.rose500,
  gradientTo: palette.violet500,
});

export const aurora = stylex.createTheme(colors, {
  accent: palette.teal500,
  accentHover: palette.teal400,
  accentText: palette.teal400,
  accentSubtle: palette.teal500,
  signal: palette.violet400,
  signalBright: palette.violet300,
  borderFocus: palette.teal400,
  textOnAccent: palette.ink000,
  gradientWarm: palette.teal500,
  gradientFrom: palette.teal400,
  gradientVia: palette.violet500,
  gradientTo: palette.rose500,
});

export const daylight = stylex.createTheme(colors, {
  bgBase: palette.ink950,
  bgSunken: palette.ink900,
  bgSurface: palette.ink950,
  bgRaised: palette.ink950,
  bgOverlay: palette.ink900,
  bgHover: palette.ink900,

  textPrimary: palette.ink100,
  textSecondary: palette.ink300,
  textMuted: palette.ink500,
  textSubtle: palette.ink600,
  textOnAccent: palette.ink950,

  border: palette.ink800,
  borderStrong: palette.ink700,
  borderFocus: palette.violet600,

  accent: palette.violet600,
  accentHover: palette.violet500,
  accentText: palette.violet600,
  accentSubtle: palette.violet600,

  signal: palette.rose600,
  signalBright: palette.rose500,

  pass: palette.green500,
  warn: palette.amber500,
  fail: palette.red500,

  // On a light ground the film has to darken, not lighten, or glass vanishes.
  gridLine: film.dark04,
  gridLineStrong: film.dark04,
  glassFill: film.dark04,
  glassFillStrong: film.dark04,
  glassEdge: film.dark04,
  glassHighlight: film.light16,
  scrim: film.light16,

  gradientWarm: palette.amber500,
  gradientFrom: palette.rose600,
  gradientVia: palette.violet600,
  gradientTo: palette.teal500,
});

export const THEMES = [
  { id: 'midnight', name: 'Midnight', className: null, swatch: palette.violet500 },
  { id: 'ember', name: 'Ember', className: ember, swatch: palette.rose500 },
  { id: 'aurora', name: 'Aurora', className: aurora, swatch: palette.teal500 },
  { id: 'daylight', name: 'Daylight', className: daylight, swatch: palette.ink900 },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];
