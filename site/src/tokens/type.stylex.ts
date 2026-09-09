import * as stylex from '@stylexjs/stylex';
import { font, size } from './primitives.stylex';

/**
 * LAYER 2 — SEMANTIC TYPE
 *
 * One superfamily. Weight and tracking carry the hierarchy, which is why the
 * display sizes get negative letter-spacing and the labels get positive.
 */
export const type = stylex.defineVars({
  familyBody: font.sans,
  familyMono: font.mono,

  microSize: size.t0,
  labelSize: size.t1,
  captionSize: size.t2,
  bodySize: size.t3,
  leadSize: size.t4,
  titleSize: size.t5,
  headingSize: size.t6,
  displaySize: size.t7,
  heroSize: size.t8,
  megaSize: size.t9,
  colossalSize: size.t10,

  weightRegular: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',

  leadingTight: '1.05',
  leadingSnug: '1.2',
  leadingNormal: '1.5',
  leadingRelaxed: '1.65',

  trackingTight: '-0.03em',
  trackingSnug: '-0.015em',
  trackingNormal: '0em',
  trackingWide: '0.08em',
  trackingLabel: '0.14em',
});
