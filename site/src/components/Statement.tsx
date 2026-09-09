import * as stylex from '@stylexjs/stylex';
import type { ReactNode, ElementType } from 'react';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';

/**
 * A STATEMENT: a thesis and its continuation as one typographic block at one
 * size, the thesis in primary ink and the continuation muted.
 *
 * This is a single system primitive, not a headline style — the same shape
 * carries a hero, a section intro and a body lead-in. Splitting it into a
 * separate `<h2>` and `<p>` is what makes a page read as two decisions where
 * there should be one.
 */
const styles = stylex.create({
  base: {
    fontFamily: t.familyBody,
    margin: space.none,
    textWrap: 'balance',
    color: colors.textPrimary,
  },
  mega: {
    fontSize: { default: t.megaSize, '@media (max-width: 860px)': t.displaySize },
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    lineHeight: t.leadingTight,
  },
  display: {
    fontSize: { default: t.displaySize, '@media (max-width: 860px)': t.headingSize },
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    lineHeight: t.leadingSnug,
  },
  title: {
    fontSize: t.titleSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingSnug,
    lineHeight: t.leadingSnug,
  },
  body: {
    fontSize: t.bodySize,
    fontWeight: t.weightRegular,
    lineHeight: t.leadingRelaxed,
    textWrap: 'pretty',
  },
  tail: { color: colors.textSecondary, fontWeight: 'inherit' },
  tailBody: { color: colors.textMuted },
});

type Scale = 'mega' | 'display' | 'title' | 'body';

const TAG: Record<Scale, ElementType> = {
  mega: 'h1', display: 'h2', title: 'h3', body: 'p',
};

export function Statement({
  scale = 'display',
  children,
  tail,
  as,
  style,
}: {
  scale?: Scale;
  children: ReactNode;
  tail?: ReactNode;
  as?: ElementType;
  style?: stylex.StyleXStyles;
}) {
  const Tag = as ?? TAG[scale];
  return (
    <Tag {...stylex.props(styles.base, styles[scale], style)}>
      {children}
      {tail ? (
        <>
          {' '}
          <span {...stylex.props(styles.tail, scale === 'body' && styles.tailBody)}>
            {tail}
          </span>
        </>
      ) : null}
    </Tag>
  );
}
