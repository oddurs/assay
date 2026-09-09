import * as stylex from '@stylexjs/stylex';
import { curve } from './primitives.stylex';

/** LAYER 2 — MOTION. Durations are named by perceived weight, not milliseconds. */
export const motion = stylex.defineVars({
  instant: '80ms',
  quick: '140ms',
  smooth: '240ms',
  deliberate: '420ms',
  ambient: '900ms',

  easeStandard: curve.standard,
  easeEntrance: curve.entrance,
  easeLinear: curve.linear,
});

export const layer = stylex.defineVars({
  base: '0',
  raised: '10',
  sticky: '100',
  overlay: '1000',
});
