import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { stroke } from '../tokens/shape.stylex';

/**
 * A band of measured facts. Value first and bright, label after and muted, so
 * the row scans as numbers with captions rather than a sentence.
 */
const styles = stylex.create({
  root: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(auto-fit, minmax(128px, 1fr))',
      '@media (max-width: 640px)': 'repeat(2, minmax(0, 1fr))',
    },
    gap: space.gutter,
    width: '100%',
  },
  ruled: {
    paddingBlockStart: space.gutter,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.hair,
    paddingInlineStart: space.snug,
    borderInlineStartWidth: stroke.bold,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colors.gridLineStrong,
  },
  value: {
    fontFamily: t.familyBody,
    fontSize: t.titleSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingSnug,
    lineHeight: t.leadingSnug,
    color: colors.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  },
  label: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    lineHeight: t.leadingNormal,
    color: colors.textSubtle,
  },
});

export type Fact = { value: string; label: string };

export function FactRow({ facts, ruled }: { facts: Fact[]; ruled?: boolean }) {
  return (
    <div {...stylex.props(styles.root, ruled && styles.ruled)}>
      {facts.map((f) => (
        <div key={f.label} {...stylex.props(styles.cell)}>
          <span {...stylex.props(styles.value)}>{f.value}</span>
          <span {...stylex.props(styles.label)}>{f.label}</span>
        </div>
      ))}
    </div>
  );
}
