import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke, elevation } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.snug,
    fontFamily: t.familyBody,
    fontSize: t.bodySize,
    fontWeight: t.weightMedium,
    letterSpacing: t.trackingSnug,
    lineHeight: t.leadingSnug,
    borderRadius: radius.round,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, border-color, color, box-shadow, transform',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
    userSelect: 'none',
    transform: { default: null, ':active': 'translateY(1px)' },
  },
  md: { paddingBlock: space.snug, paddingInline: space.gutter },
  lg: { paddingBlock: space.cozy, paddingInline: space.roomy, fontSize: t.leadSize },

  primary: {
    backgroundColor: { default: colors.accent, ':hover': colors.accentHover },
    borderColor: { default: colors.accent, ':hover': colors.accentHover },
    color: colors.textOnAccent,
    boxShadow: { default: elevation.glow, ':hover': elevation.glow },
  },
  secondary: {
    backgroundColor: { default: colors.bgRaised, ':hover': colors.bgHover },
    borderColor: { default: colors.border, ':hover': colors.borderStrong },
    color: colors.textPrimary,
  },
  ghost: {
    backgroundColor: { default: 'transparent', ':hover': colors.bgRaised },
    borderColor: 'transparent',
    color: { default: colors.textMuted, ':hover': colors.textPrimary },
  },
});

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  onClick,
  style,
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: 'md' | 'lg';
  onClick?: () => void;
  style?: stylex.StyleXStyles;
}) {
  const sx = stylex.props(
    styles.base,
    size === 'lg' ? styles.lg : styles.md,
    styles[variant],
    style,
  );
  return href ? (
    <a href={href} {...sx}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} {...sx}>
      {children}
    </button>
  );
}
