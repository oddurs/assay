import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.snug,
    textDecoration: 'none',
    color: colors.signal,
  },
  glyph: { display: 'block', flexShrink: 0 },
  word: {
    fontFamily: t.familyBody,
    fontSize: t.leadSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingSnug,
    color: colors.textPrimary,
  },
});

/** A meniscus in a sample dish — the assay, literally. */
export function Logo({ href = '#top' }: { href?: string }) {
  return (
    <a href={href} {...stylex.props(styles.root)}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        {...stylex.props(styles.glyph)}
      >
        <circle
          cx="11"
          cy="11"
          r="9.25"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.28"
        />
        <path
          d="M2.4 12.6a8.6 8.6 0 0 0 17.2 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="11" cy="8.2" r="1.6" fill="currentColor" />
      </svg>
      <span {...stylex.props(styles.word)}>assay</span>
    </a>
  );
}
