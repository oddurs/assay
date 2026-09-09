import * as stylex from '@stylexjs/stylex';
import { palette, film } from './primitives.stylex';

/**
 * LAYER 2 — SEMANTIC COLOR
 *
 * Every token names a ROLE, never a hue. `colors.accent`, never
 * `colors.violet500`. This is what makes Layer 3 possible: a theme overrides
 * meaning, and no component has to know it happened.
 */
export const colors = stylex.defineVars({
  // Surfaces, in stacking order
  bgBase: palette.ink000,
  bgSunken: palette.ink050,
  bgSurface: palette.ink100,
  bgRaised: palette.ink150,
  bgOverlay: palette.ink200,
  bgHover: palette.ink300,

  // Text, in descending emphasis
  textPrimary: palette.ink900,
  textSecondary: palette.ink800,
  textMuted: palette.ink700,
  textSubtle: palette.ink600,
  textOnAccent: palette.ink950,

  // Lines
  border: palette.ink300,
  borderStrong: palette.ink400,
  borderFocus: palette.violet400,

  // Structure. The hairline grid is a first-class surface here, not decoration:
  // this is a measurement tool, and graph paper is its native material.
  gridLine: film.light04,
  gridLineStrong: film.light06,

  // Glass. A translucent plate over whatever it sits on, with a bright hairline
  // edge and a brighter top highlight — the two details that stop a dark
  // translucent panel reading as flat grey.
  glassFill: film.light04,
  glassFillStrong: film.light06,
  glassEdge: film.light10,
  glassHighlight: film.light16,
  scrim: film.dark60,

  // Interactive. `accentHover` is a FILL and goes darker, so the white label
  // keeps its contrast; `accentText` is the light variant for accent-coloured
  // text on a dark surface. Assay caught these being the same token.
  accent: palette.violet500,
  accentHover: palette.violet600,
  accentText: palette.violet400,
  accentSubtle: palette.violet600,

  // Brand signal — used for data, emphasis, the mark
  signal: palette.rose500,
  signalBright: palette.rose400,

  // Status. Reserved: never reused as a decorative hue.
  pass: palette.green400,
  warn: palette.amber400,
  fail: palette.red400,

  // The gradient ribbon. Four stops, warm to cool, so the sweep has somewhere
  // to travel — a three-stop ramp reads as a single hue with a tint.
  gradientWarm: palette.amber400,
  gradientFrom: palette.rose500,
  gradientVia: palette.violet500,
  gradientTo: palette.teal500,
});
