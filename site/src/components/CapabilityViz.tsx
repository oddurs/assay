import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';

/**
 * A small purpose-built figure for each capability.
 *
 * Four capabilities described only in prose beside one terminal that
 * illustrates none of them specifically is the weakest way to answer "what
 * does it do". Each of these shows the SHAPE of its own answer.
 */
const styles = stylex.create({
  frame: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: space.snug,
    minHeight: space.bay,
    padding: space.gutter,
    borderRadius: radius.round,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.bgSunken,
    overflow: 'hidden',
  },
  mono: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textSubtle,
    fontVariantNumeric: 'tabular-nums',
  },

  // 01 — a score climbing against a target
  scoreRow: { display: 'flex', alignItems: 'baseline', gap: space.snug },
  scoreNow: {
    fontFamily: t.familyBody,
    fontSize: t.headingSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    color: colors.pass,
    fontVariantNumeric: 'tabular-nums',
  },
  scoreWas: {
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    color: colors.textSubtle,
  },
  track: {
    position: 'relative',
    height: space.snug,
    borderRadius: radius.pill,
    backgroundColor: colors.bgOverlay,
    overflow: 'hidden',
  },
  was: (w: string) => ({
    position: 'absolute',
    insetBlock: space.none,
    insetInlineStart: space.none,
    width: w,
    backgroundColor: colors.textSubtle,
    opacity: 0.45,
  }),
  now: (w: string) => ({
    position: 'absolute',
    insetBlock: space.none,
    insetInlineStart: space.none,
    width: w,
    backgroundColor: colors.pass,
    borderRadius: radius.pill,
  }),

  // 02 — one token fanning out to many components
  fan: { display: 'flex', alignItems: 'center', gap: space.snug },
  seed: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.signalBright,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.signal,
    borderRadius: radius.sharp,
    paddingBlock: space.hair,
    paddingInline: space.tight,
    whiteSpace: 'nowrap',
  },
  arrow: { color: colors.textSubtle, fontFamily: t.familyMono, fontSize: t.microSize },
  dots: { display: 'flex', flexWrap: 'wrap', gap: space.hair, flex: '1' },
  dot: {
    width: space.snug,
    height: space.snug,
    borderRadius: radius.sharp,
    backgroundColor: colors.accent,
  },
  dotFaint: { backgroundColor: colors.gridLineStrong },

  // 03 — the changed subset of a grid of units
  matrix: { display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: space.hair },
  cell: {
    aspectRatio: '1',
    borderRadius: radius.sharp,
    backgroundColor: colors.gridLineStrong,
  },
  cellHit: { backgroundColor: colors.warn },

  // 04 — a contrast pairing, pass and fail
  swatches: { display: 'flex', gap: space.snug, flexWrap: 'wrap' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.tight,
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    paddingBlock: space.tight,
    paddingInline: space.snug,
    borderRadius: radius.soft,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
  },
  chipPass: { color: colors.pass, borderColor: colors.pass },
  chipFail: { color: colors.fail, borderColor: colors.fail },
});

export function ScoreViz() {
  return (
    <div {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.scoreRow)}>
        <span {...stylex.props(styles.scoreNow)}>87%</span>
        <span {...stylex.props(styles.scoreWas)}>was 61%</span>
      </div>
      <div {...stylex.props(styles.track)}>
        <div {...stylex.props(styles.was('61%'))} />
        <div {...stylex.props(styles.now('87%'))} />
      </div>
      <span {...stylex.props(styles.mono)}>adherence, one quarter</span>
    </div>
  );
}

export function BlastViz() {
  return (
    <div {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.fan)}>
        <span {...stylex.props(styles.seed)}>space.md</span>
        <span {...stylex.props(styles.arrow)}>→</span>
        <span {...stylex.props(styles.dots)}>
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} {...stylex.props(styles.dot, i > 17 && styles.dotFaint)} />
          ))}
        </span>
      </div>
      <span {...stylex.props(styles.mono)}>
        218 components · 6 teams · 3 outside your org
      </span>
    </div>
  );
}

const CHANGED = new Set([17, 18, 19, 31, 32, 45, 46, 47, 60, 61]);

export function ChangeSetViz() {
  return (
    <div {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.matrix)}>
        {Array.from({ length: 70 }, (_, i) => (
          <span
            key={i}
            {...stylex.props(styles.cell, CHANGED.has(i) && styles.cellHit)}
          />
        ))}
      </div>
      <span {...stylex.props(styles.mono)}>
        10 of 70 units changed · screenshot only those
      </span>
    </div>
  );
}

export function ContrastViz() {
  return (
    <div {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.swatches)}>
        <span {...stylex.props(styles.chip, styles.chipPass)}>12.30:1 pass</span>
        <span {...stylex.props(styles.chip, styles.chipFail)}>2.87:1 fail</span>
      </div>
      <span {...stylex.props(styles.mono)}>
        pairings that actually render, not the palette
      </span>
    </div>
  );
}
