import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke, elevation } from '../tokens/shape.stylex';

/**
 * A composed specimen, not a swatch sampler.
 *
 * Loose swatches prove a colour changed. A small real surface — header, stat,
 * plot, controls, status rows — proves the SYSTEM changed: corners, elevation,
 * hairline weight and colour all move together, and nothing in here knows a
 * theme exists.
 */
const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: radius.loud,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.bgSurface,
    boxShadow: elevation.mid,
    overflow: 'hidden',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: space.snug,
    paddingBlock: space.snug,
    paddingInline: space.gutter,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    backgroundColor: colors.bgRaised,
  },
  dot: { width: space.snug, height: space.snug, borderRadius: radius.pill, backgroundColor: colors.accent },
  barTitle: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    fontWeight: t.weightSemibold,
    color: colors.textPrimary,
  },
  pill: {
    marginInlineStart: 'auto',
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    textTransform: 'uppercase',
    color: colors.textOnAccent,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingBlock: space.hair,
    paddingInline: space.snug,
  },
  body: { display: 'flex', flexDirection: 'column', gap: space.gutter, padding: space.gutter },

  headline: { display: 'flex', alignItems: 'baseline', gap: space.snug },
  big: {
    fontFamily: t.familyBody,
    fontSize: t.headingSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    color: colors.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  },
  delta: { fontFamily: t.familyMono, fontSize: t.microSize, color: colors.pass },
  caption: { fontFamily: t.familyBody, fontSize: t.captionSize, color: colors.textMuted },

  plot: { display: 'flex', alignItems: 'flex-end', gap: space.hair, height: space.bay },
  bara: (h: string) => ({
    flex: '1',
    height: h,
    borderStartStartRadius: radius.sharp,
    borderStartEndRadius: radius.sharp,
    backgroundColor: colors.accent,
    opacity: 0.55,
  }),
  peak: { backgroundColor: colors.signal, opacity: 1 },

  controls: { display: 'flex', gap: space.snug, alignItems: 'center', flexWrap: 'wrap' },
  input: {
    flex: '1',
    minWidth: '120px',
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textMuted,
    backgroundColor: colors.bgSunken,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.soft,
    paddingBlock: space.snug,
    paddingInline: space.snug,
  },
  btn: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    fontWeight: t.weightMedium,
    color: colors.textOnAccent,
    backgroundColor: colors.accent,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.accent,
    borderRadius: radius.soft,
    paddingBlock: space.snug,
    paddingInline: space.gutter,
  },
  btnGhost: {
    color: colors.textMuted,
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },

  rows: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: space.snug,
    paddingBlock: space.snug,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  rowName: { fontFamily: t.familyMono, fontSize: t.microSize, color: colors.textMuted },
  status: {
    marginInlineStart: 'auto',
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    borderRadius: radius.sharp,
    paddingBlock: space.hair,
    paddingInline: space.tight,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
  },
  ok: { color: colors.pass, borderColor: colors.pass },
  warnS: { color: colors.warn, borderColor: colors.warn },
  bad: { color: colors.fail, borderColor: colors.fail },
});

const BARS = ['34%', '52%', '41%', '68%', '86%', '58%', '73%', '46%', '61%', '38%'];

export function ThemeSpecimen() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.bar)}>
        <span {...stylex.props(styles.dot)} aria-hidden />
        <span {...stylex.props(styles.barTitle)}>billing / Invoice.tsx</span>
        <span {...stylex.props(styles.pill)}>scored</span>
      </div>

      <div {...stylex.props(styles.body)}>
        <div>
          <div {...stylex.props(styles.headline)}>
            <span {...stylex.props(styles.big)}>87.4%</span>
            <span {...stylex.props(styles.delta)}>+26 pts</span>
          </div>
          <span {...stylex.props(styles.caption)}>token conformance, this quarter</span>
        </div>

        <div {...stylex.props(styles.plot)} role="img" aria-label="Conformance trend">
          {BARS.map((h, i) => (
            <span key={i} {...stylex.props(styles.bara(h), i === 4 && styles.peak)} />
          ))}
        </div>

        <div {...stylex.props(styles.controls)}>
          <span {...stylex.props(styles.input)}>--gate 90</span>
          <span {...stylex.props(styles.btn)}>Run</span>
          <span {...stylex.props(styles.btn, styles.btnGhost)}>Diff</span>
        </div>

        <div {...stylex.props(styles.rows)}>
          <div {...stylex.props(styles.row)}>
            <span {...stylex.props(styles.rowName)}>colors.accent</span>
            <span {...stylex.props(styles.status, styles.ok)}>pass</span>
          </div>
          <div {...stylex.props(styles.row)}>
            <span {...stylex.props(styles.rowName)}>space.md</span>
            <span {...stylex.props(styles.status, styles.warnS)}>218 refs</span>
          </div>
          <div {...stylex.props(styles.row)}>
            <span {...stylex.props(styles.rowName)}>radius.loud</span>
            <span {...stylex.props(styles.status, styles.bad)}>dead</span>
          </div>
        </div>
      </div>
    </div>
  );
}
