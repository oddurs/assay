import * as stylex from '@stylexjs/stylex';
import { palette, scale, blurLength } from './primitives.stylex';

/** LAYER 2 — RADIUS, ELEVATION, BORDER WIDTH */

export const radius = stylex.defineVars({
  none: scale.s0,
  sharp: scale.s2,
  soft: scale.s3,
  round: scale.s4,
  loud: scale.s5,
  pill: '999px',
});

export const stroke = stylex.defineVars({
  hair: '1px',
  bold: '2px',
});

/** Named by what the blur is FOR, not how many pixels it is. */
export const blur = stylex.defineVars({
  none: blurLength.none,
  glass: blurLength.glass,
  veil: blurLength.veil,
  ambient: blurLength.ambient,
});

export const elevation = stylex.defineVars({
  flat: 'none',
  low: `0 1px 2px ${palette.ink000}`,
  mid: `0 4px 16px -4px ${palette.ink000}`,
  high: `0 24px 64px -24px ${palette.ink000}`,
  glow: `0 0 48px -12px ${palette.violet600}`,
  signalGlow: `0 0 40px -14px ${palette.rose600}`,
});
