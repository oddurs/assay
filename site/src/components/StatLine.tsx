import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';

/**
 * A precise number as an eyebrow. The absurd precision is the point: it says
 * the figure was measured rather than rounded for a slide.
 */
const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: space.snug,
    flexWrap: 'wrap',
    fontFamily: t.familyMono,
    fontSize: t.labelSize,
    lineHeight: t.leadingNormal,
  },
  label: { color: colors.textSubtle },
  value: { color: colors.signalBright, fontVariantNumeric: 'tabular-nums' },
  note: { color: colors.textSubtle },
});

export function StatLine({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div {...stylex.props(styles.root)}>
      <span {...stylex.props(styles.label)}>{label}</span>
      <span {...stylex.props(styles.value)}>{value}</span>
      {note ? <span {...stylex.props(styles.note)}>{note}</span> : null}
    </div>
  );
}
