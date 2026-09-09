import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { radius, stroke, elevation } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';

const styles = stylex.create({
  root: {
    backgroundColor: colors.bgSurface,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.loud,
    padding: space.roomy,
    boxShadow: elevation.mid,
    transitionProperty: 'border-color, box-shadow, transform',
    transitionDuration: motion.smooth,
    transitionTimingFunction: motion.easeStandard,
  },
  interactive: {
    borderColor: { default: colors.border, ':hover': colors.borderStrong },
    transform: { default: null, ':hover': 'translateY(-2px)' },
    boxShadow: { default: elevation.mid, ':hover': elevation.high },
  },
  flush: { padding: space.none, overflow: 'hidden' },
});

export function Card({
  children,
  interactive,
  flush,
  style,
}: {
  children: ReactNode;
  interactive?: boolean;
  flush?: boolean;
  style?: stylex.StyleXStyles;
}) {
  return (
    <div
      {...stylex.props(
        styles.root,
        interactive && styles.interactive,
        flush && styles.flush,
        style,
      )}
    >
      {children}
    </div>
  );
}
