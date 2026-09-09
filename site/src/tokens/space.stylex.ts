import * as stylex from '@stylexjs/stylex';
import { scale } from './primitives.stylex';

/**
 * LAYER 2 — SEMANTIC SPACE
 *
 * Named by intent. A component asks for `space.gutter`, not `16px`, so the
 * rhythm of the whole site is adjustable from one file.
 */
export const space = stylex.defineVars({
  none: scale.s0,
  hair: scale.s1,
  tight: scale.s2,
  snug: scale.s3,
  cozy: scale.s4,
  gutter: scale.s5,
  roomy: scale.s6,
  loose: scale.s7,
  section: scale.s8,
  bay: scale.s9,
  chapter: scale.s10,
  act: scale.s11,
  vista: scale.s12,
  cell: scale.cell,
});
