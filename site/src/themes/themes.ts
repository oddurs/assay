import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { radius, elevation, stroke } from '../tokens/shape.stylex';
import { palette, film, warm, sea, bone } from '../tokens/primitives.stylex';

/**
 * LAYER 3 — THEMES
 *
 * A theme here is not a palette. `createTheme` can override ANY `defineVars`
 * group, so each theme below is a BUNDLE: colour, corner radius and elevation
 * together. That is the difference between swapping some CSS variables and
 * re-skinning a design system — Foundry has square corners and hard shadows
 * because it is industrial, and Bone has almost no elevation because paper
 * does not float.
 *
 * No component knows any of this exists.
 */

/* ---------------------------------------------------------------- *
 * FOUNDRY — warm graphite and a single amber. Industrial, restrained,
 * nearly monochrome: one accent doing all the work.
 * ---------------------------------------------------------------- */

const foundryColors = stylex.createTheme(colors, {
  bgBase: warm.w000,
  bgSunken: warm.w050,
  bgSurface: warm.w100,
  bgRaised: warm.w150,
  bgOverlay: warm.w200,
  bgHover: warm.w300,

  textPrimary: warm.w900,
  textSecondary: warm.w800,
  textMuted: warm.w700,
  textSubtle: warm.w600,
  textOnAccent: warm.w000,

  border: warm.w300,
  borderStrong: warm.w400,
  borderFocus: warm.amber400,

  gridLine: film.light04,
  gridLineStrong: film.light06,
  glassFill: film.light04,
  glassFillStrong: film.light06,
  glassEdge: film.light10,
  glassHighlight: film.light16,
  scrim: 'rgba(10, 9, 8, 0.72)',

  accent: warm.amber500,
  accentHover: warm.amber400,
  accentText: warm.amber300,
  accentSubtle: warm.amber500,

  signal: warm.amber400,
  signalBright: warm.amber300,

  pass: palette.green400,
  warn: warm.amber400,
  fail: palette.red400,

  gradientWarm: warm.amber300,
  gradientFrom: warm.amber400,
  gradientVia: warm.amber500,
  gradientTo: warm.w500,
});

const foundryShape = stylex.createTheme(radius, {
  none: '0px',
  sharp: '0px',
  soft: '2px',
  round: '3px',
  loud: '4px',
  pill: '999px',
});

const foundryElevation = stylex.createTheme(elevation, {
  flat: 'none',
  low: `0 1px 0 ${warm.w000}`,
  mid: `0 2px 0 ${warm.w000}`,
  high: `0 4px 0 ${warm.w000}`,
  glow: `0 0 0 1px ${warm.amber500}`,
  signalGlow: `0 0 0 1px ${warm.amber400}`,
});

/* ---------------------------------------------------------------- *
 * VERDIGRIS — oxidised copper on deep sea green. Patina: aged, humid,
 * high chroma held down by a very dark ground.
 * ---------------------------------------------------------------- */

const verdigrisColors = stylex.createTheme(colors, {
  bgBase: sea.s000,
  bgSunken: sea.s050,
  bgSurface: sea.s100,
  bgRaised: sea.s150,
  bgOverlay: sea.s200,
  bgHover: sea.s300,

  textPrimary: sea.s900,
  textSecondary: sea.s800,
  textMuted: sea.s700,
  textSubtle: sea.s600,
  textOnAccent: sea.s000,

  border: sea.s300,
  borderStrong: sea.s400,
  borderFocus: sea.patina400,

  gridLine: film.light04,
  gridLineStrong: film.light06,
  glassFill: film.light04,
  glassFillStrong: film.light06,
  glassEdge: film.light10,
  glassHighlight: film.light16,
  scrim: 'rgba(4, 16, 13, 0.72)',

  accent: sea.patina500,
  accentHover: sea.patina400,
  accentText: sea.patina400,
  accentSubtle: sea.s500,

  signal: sea.copper400,
  signalBright: sea.copper400,

  pass: sea.patina400,
  warn: warm.amber400,
  fail: sea.copper500,

  gradientWarm: sea.copper400,
  gradientFrom: sea.copper500,
  gradientVia: sea.patina500,
  gradientTo: sea.s500,
});

const verdigrisShape = stylex.createTheme(radius, {
  none: '0px',
  sharp: '3px',
  soft: '7px',
  round: '11px',
  loud: '18px',
  pill: '999px',
});

const verdigrisElevation = stylex.createTheme(elevation, {
  flat: 'none',
  low: `0 1px 2px ${sea.s000}`,
  mid: `0 6px 20px -6px ${sea.s000}`,
  high: `0 28px 70px -28px ${sea.s000}`,
  glow: `0 0 56px -14px ${sea.patina500}`,
  signalGlow: `0 0 44px -14px ${sea.copper500}`,
});

/* ---------------------------------------------------------------- *
 * BONE — warm paper, printer's ink, oxblood. Editorial: hairlines
 * instead of shadows, because paper does not float.
 * ---------------------------------------------------------------- */

const boneColors = stylex.createTheme(colors, {
  bgBase: bone.p050,
  bgSunken: bone.p100,
  bgSurface: bone.p000,
  bgRaised: bone.p000,
  bgOverlay: bone.p100,
  bgHover: bone.p200,

  textPrimary: bone.p900,
  textSecondary: bone.p700,
  textMuted: bone.p600,
  textSubtle: bone.p500,
  textOnAccent: bone.p000,

  border: bone.p300,
  borderStrong: bone.p400,
  borderFocus: bone.indigo500,

  // On paper the film must darken, or every glass surface disappears.
  gridLine: 'rgba(36, 31, 26, 0.06)',
  gridLineStrong: 'rgba(36, 31, 26, 0.12)',
  glassFill: 'rgba(255, 255, 255, 0.66)',
  glassFillStrong: 'rgba(255, 255, 255, 0.82)',
  glassEdge: 'rgba(36, 31, 26, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.9)',
  scrim: 'rgba(251, 248, 242, 0.82)',

  accent: bone.ox500,
  accentHover: bone.p700,
  accentText: bone.ox500,
  accentSubtle: bone.ox400,

  signal: bone.ox500,
  signalBright: bone.ox400,

  pass: '#1F6B3A',
  warn: warm.amber600,
  fail: bone.ox500,

  gradientWarm: warm.amber400,
  gradientFrom: bone.ox400,
  gradientVia: bone.indigo500,
  gradientTo: sea.patina500,
});

const boneShape = stylex.createTheme(radius, {
  none: '0px',
  sharp: '1px',
  soft: '2px',
  round: '4px',
  loud: '6px',
  pill: '999px',
});

const boneElevation = stylex.createTheme(elevation, {
  flat: 'none',
  low: 'none',
  mid: `0 1px 2px rgba(36, 31, 26, 0.06)`,
  high: `0 12px 32px -16px rgba(36, 31, 26, 0.22)`,
  glow: 'none',
  signalGlow: 'none',
});

const boneStroke = stylex.createTheme(stroke, { hair: '1px', bold: '3px' });

/* ---------------------------------------------------------------- */

export type ThemeDef = {
  id: string;
  name: string;
  /** The point of view, in one line. A theme without one is a hue rotation. */
  blurb: string;
  /**
   * The bundle, resolved to a class name once at module scope. Theme objects
   * are heterogeneous VarGroups, so there is no single style type that covers
   * an array of them — resolving each bundle here keeps the whole thing typed
   * with no cast at the call site.
   */
  className: string;
  swatches: string[];
  overrides: string[];
};

export const THEMES: ThemeDef[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    blurb: 'Cold, precise, glassy. Indigo on blue-black.',
    className: '',
    swatches: [
      palette.ink000,
      palette.ink200,
      palette.violet500,
      palette.rose500,
      palette.teal400,
    ],
    overrides: ['colors'],
  },
  {
    id: 'foundry',
    name: 'Foundry',
    blurb: 'Warm graphite and a single amber. Square corners, hard shadows.',
    className:
      stylex.props(foundryColors, foundryShape, foundryElevation).className ?? '',
    swatches: [warm.w000, warm.w200, warm.amber500, warm.amber300, warm.w700],
    overrides: ['colors', 'radius', 'elevation'],
  },
  {
    id: 'verdigris',
    name: 'Verdigris',
    blurb: 'Oxidised copper on deep sea green. Softer corners, deep glow.',
    className:
      stylex.props(verdigrisColors, verdigrisShape, verdigrisElevation).className ?? '',
    swatches: [sea.s000, sea.s200, sea.patina500, sea.copper400, sea.s600],
    overrides: ['colors', 'radius', 'elevation'],
  },
  {
    id: 'bone',
    name: 'Bone',
    blurb: 'Warm paper, printer’s ink, oxblood. Hairlines, not shadows.',
    className:
      stylex.props(boneColors, boneShape, boneElevation, boneStroke).className ?? '',
    swatches: [bone.p050, bone.p200, bone.ox500, bone.indigo500, bone.p600],
    overrides: ['colors', 'radius', 'elevation', 'stroke'],
  },
];

export type ThemeId = string;
