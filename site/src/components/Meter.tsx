import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';

const styles = stylex.create({
  wrap: { display: 'flex', flexDirection: 'column', gap: space.snug, width: '100%' },
  head: { display: 'flex', alignItems: 'baseline', gap: space.snug },
  value: {
    fontFamily: t.familyBody,
    fontSize: t.displaySize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    lineHeight: t.leadingTight,
    fontVariantNumeric: 'tabular-nums',
  },
  label: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    fontWeight: t.weightMedium,
    color: colors.textMuted,
    lineHeight: t.leadingNormal,
  },
  denom: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textSubtle,
    marginInlineStart: 'auto',
    fontVariantNumeric: 'tabular-nums',
  },
  track: {
    position: 'relative',
    height: space.snug,
    backgroundColor: colors.bgOverlay,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  // A StyleX dynamic style: compiles to a CSS custom property set inline.
  // Assay reports these as `dynamic` — genuinely unknowable at build time,
  // and never counted as either a pass or a violation.
  fill: (width: string) => ({
    position: 'absolute',
    insetBlock: space.none,
    insetInlineStart: space.none,
    width,
    borderRadius: radius.pill,
    transitionProperty: 'width, background-color',
    transitionDuration: motion.deliberate,
    transitionTimingFunction: motion.easeEntrance,
  }),
  tonePass: { backgroundColor: colors.pass },
  toneWarn: { backgroundColor: colors.warn },
  toneFail: { backgroundColor: colors.fail },
  toneAccent: { backgroundColor: colors.accent },
  target: (left: string) => ({
    position: 'absolute',
    insetBlock: space.none,
    insetInlineStart: left,
    width: stroke.bold,
    backgroundColor: colors.textPrimary,
  }),
});

export function Meter({
  value,
  label,
  denom,
  target,
  tone,
}: {
  value: number;
  label?: string;
  denom?: string;
  target?: number;
  tone?: 'pass' | 'warn' | 'fail' | 'accent';
}) {
  const pct = Math.max(0, Math.min(1, value));
  const auto = pct >= 0.9 ? 'pass' : pct >= 0.6 ? 'warn' : 'fail';
  const t2 = tone ?? auto;
  const toneStyle =
    t2 === 'pass' ? styles.tonePass
    : t2 === 'warn' ? styles.toneWarn
    : t2 === 'fail' ? styles.toneFail
    : styles.toneAccent;

  return (
    <div {...stylex.props(styles.wrap)}>
      <div {...stylex.props(styles.head)}>
        <span {...stylex.props(styles.value)}>{(pct * 100).toFixed(1)}%</span>
        {label ? <span {...stylex.props(styles.label)}>{label}</span> : null}
        {denom ? <span {...stylex.props(styles.denom)}>{denom}</span> : null}
      </div>
      <div {...stylex.props(styles.track)}>
        <div {...stylex.props(styles.fill(`${pct * 100}%`), toneStyle)} />
        {target != null ? (
          <div {...stylex.props(styles.target(`${target * 100}%`))} />
        ) : null}
      </div>
    </div>
  );
}
