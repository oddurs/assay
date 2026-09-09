import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { radius, stroke, blur, elevation } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';

/**
 * A glass plate.
 *
 * Three details separate glass from "a grey box with opacity", and all three
 * are in this one place so no section has to remember them:
 *   1. a translucent fill over a real backdrop blur
 *   2. a bright hairline edge
 *   3. a brighter highlight on the TOP edge only, which is what reads as a
 *      lit bevel and gives the plate a direction
 */
const styles = stylex.create({
  root: {
    position: 'relative',
    backgroundColor: colors.glassFill,
    backdropFilter: `blur(${blur.glass})`,
    WebkitBackdropFilter: `blur(${blur.glass})`,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.glassEdge,
    borderRadius: radius.loud,
    boxShadow: elevation.mid,
    transitionProperty: 'border-color, background-color, transform, box-shadow',
    transitionDuration: motion.smooth,
    transitionTimingFunction: motion.easeStandard,
    isolation: 'isolate',
  },
  pad: { padding: space.roomy },
  // The lit top edge. One pixel, and it does most of the work.
  highlight: {
    '::before': {
      content: '""',
      position: 'absolute',
      insetBlockStart: space.none,
      insetInlineStart: space.roomy,
      insetInlineEnd: space.roomy,
      height: stroke.hair,
      backgroundImage: `linear-gradient(90deg, transparent, ${colors.glassHighlight}, transparent)`,
      pointerEvents: 'none',
    },
  },
  strong: { backgroundColor: colors.glassFillStrong },
  interactive: {
    borderColor: { default: colors.glassEdge, ':hover': colors.borderStrong },
    transform: { default: null, ':hover': 'translateY(-2px)' },
    boxShadow: { default: elevation.mid, ':hover': elevation.high },
  },
});

export function Glass({
  children,
  pad = true,
  strong,
  interactive,
  highlight = true,
  style,
}: {
  children: ReactNode;
  pad?: boolean;
  strong?: boolean;
  interactive?: boolean;
  highlight?: boolean;
  style?: stylex.StyleXStyles;
}) {
  return (
    <div
      {...stylex.props(
        styles.root,
        pad && styles.pad,
        strong && styles.strong,
        highlight && styles.highlight,
        interactive && styles.interactive,
        style,
      )}
    >
      {children}
    </div>
  );
}
