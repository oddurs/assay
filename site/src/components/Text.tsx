import * as stylex from '@stylexjs/stylex';
import type { ReactNode, ElementType } from 'react';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';

/**
 * The typographic scale, as components. Nothing in this project sets a
 * font-size directly — every size in the design is one of these roles.
 */
const styles = stylex.create({
  base: { fontFamily: t.familyBody, margin: space.none, textWrap: 'pretty' },

  eyebrow: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    fontWeight: t.weightMedium,
    letterSpacing: t.trackingLabel,
    lineHeight: t.leadingNormal,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  mega: {
    fontSize: { default: t.megaSize, '@media (max-width: 720px)': t.displaySize },
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    lineHeight: t.leadingTight,
    color: colors.textPrimary,
    textWrap: 'balance',
  },
  hero: {
    fontSize: { default: t.heroSize, '@media (max-width: 720px)': t.displaySize },
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    lineHeight: t.leadingTight,
    color: colors.textPrimary,
    textWrap: 'balance',
  },
  display: {
    fontSize: { default: t.displaySize, '@media (max-width: 720px)': t.headingSize },
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    lineHeight: t.leadingSnug,
    color: colors.textPrimary,
    textWrap: 'balance',
  },
  heading: {
    fontSize: t.headingSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingSnug,
    lineHeight: t.leadingSnug,
    color: colors.textPrimary,
    textWrap: 'balance',
  },
  title: {
    fontSize: t.titleSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingSnug,
    lineHeight: t.leadingSnug,
    color: colors.textPrimary,
  },
  lead: {
    fontSize: t.leadSize,
    fontWeight: t.weightRegular,
    lineHeight: t.leadingRelaxed,
    color: colors.textSecondary,
  },
  body: {
    fontSize: t.bodySize,
    fontWeight: t.weightRegular,
    lineHeight: t.leadingRelaxed,
    color: colors.textMuted,
  },
  caption: {
    fontSize: t.captionSize,
    fontWeight: t.weightRegular,
    lineHeight: t.leadingNormal,
    color: colors.textSubtle,
  },
  mono: {
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    lineHeight: t.leadingNormal,
    color: colors.textMuted,
  },
});

type Role = keyof Omit<typeof styles, 'base'>;

const DEFAULT_TAG: Record<string, ElementType> = {
  eyebrow: 'div',
  mega: 'h1',
  hero: 'h1',
  display: 'h2',
  heading: 'h3',
  title: 'h4',
  lead: 'p',
  body: 'p',
  caption: 'p',
  mono: 'span',
};

export function Text({
  as,
  role = 'body',
  children,
  style,
}: {
  as?: ElementType;
  role?: Role;
  children: ReactNode;
  style?: stylex.StyleXStyles;
}) {
  const Tag = as ?? DEFAULT_TAG[role] ?? 'p';
  return <Tag {...stylex.props(styles.base, styles[role], style)}>{children}</Tag>;
}
