import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';

/**
 * Two readings of the same measure, on one track.
 *
 * A single 100% bar says nothing — every bar looks like that. Showing the
 * reference reading behind it is what makes the number mean something, and it
 * is the honest way to present a score you produced about yourself.
 */
const styles = stylex.create({
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(84px, auto) minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: space.gutter,
    paddingBlock: space.snug,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  name: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  track: {
    position: 'relative',
    height: space.cozy,
    backgroundColor: colors.bgOverlay,
    borderRadius: radius.sharp,
    overflow: 'hidden',
  },
  fill: (w: string) => ({
    position: 'absolute',
    insetBlock: space.none,
    insetInlineStart: space.none,
    width: w,
    borderRadius: radius.sharp,
    transitionProperty: 'width',
    transitionDuration: motion.deliberate,
    transitionTimingFunction: motion.easeEntrance,
  }),
  mine: { backgroundColor: colors.pass },
  // The reference sits behind as a hatched band, so it reads as context
  // rather than as a second competing measurement.
  reference: (w: string) => ({
    position: 'absolute',
    insetBlock: space.none,
    insetInlineStart: space.none,
    width: w,
    backgroundImage: `repeating-linear-gradient(45deg, ${colors.gridLineStrong}, ${colors.gridLineStrong} 3px, transparent 3px, transparent 7px)`,
    borderInlineEndWidth: stroke.bold,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.textSubtle,
  }),
  values: {
    display: 'flex',
    alignItems: 'baseline',
    gap: space.snug,
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    fontVariantNumeric: 'tabular-nums',
  },
  mineText: { color: colors.pass },
  refText: { color: colors.textSubtle },
  legend: {
    display: 'flex',
    gap: space.gutter,
    flexWrap: 'wrap',
    marginBlockStart: space.snug,
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textSubtle,
  },
  swatch: { display: 'inline-flex', alignItems: 'center', gap: space.tight },
  chipMine: {
    width: space.cozy,
    height: space.snug,
    borderRadius: radius.sharp,
    backgroundColor: colors.pass,
  },
  chipRef: {
    width: space.cozy,
    height: space.snug,
    borderRadius: radius.sharp,
    backgroundImage: `repeating-linear-gradient(45deg, ${colors.gridLineStrong}, ${colors.gridLineStrong} 3px, transparent 3px, transparent 7px)`,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
});

export type CompareRow = { name: string; mine: number; reference: number };

export function CompareBar({
  rows,
  mineLabel,
  referenceLabel,
}: {
  rows: CompareRow[];
  mineLabel: string;
  referenceLabel: string;
}) {
  return (
    <div>
      {rows.map((r) => (
        <div key={r.name} {...stylex.props(styles.row)}>
          <span {...stylex.props(styles.name)}>{r.name}</span>
          <div {...stylex.props(styles.track)}>
            <div {...stylex.props(styles.reference(`${r.reference * 100}%`))} />
            <div {...stylex.props(styles.fill(`${r.mine * 100}%`), styles.mine)} />
          </div>
          <span {...stylex.props(styles.values)}>
            <span {...stylex.props(styles.mineText)}>{(r.mine * 100).toFixed(0)}%</span>
            <span {...stylex.props(styles.refText)}>
              {(r.reference * 100).toFixed(0)}%
            </span>
          </span>
        </div>
      ))}
      <div {...stylex.props(styles.legend)}>
        <span {...stylex.props(styles.swatch)}>
          <span {...stylex.props(styles.chipMine)} /> {mineLabel}
        </span>
        <span {...stylex.props(styles.swatch)}>
          <span {...stylex.props(styles.chipRef)} /> {referenceLabel}
        </span>
      </div>
    </div>
  );
}
