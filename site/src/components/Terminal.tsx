import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke, elevation } from '../tokens/shape.stylex';

const styles = stylex.create({
  frame: {
    backgroundColor: colors.bgBase,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    borderRadius: radius.loud,
    overflow: 'hidden',
    boxShadow: elevation.high,
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
    backgroundColor: colors.bgSurface,
  },
  dot: { width: space.snug, height: space.snug, borderRadius: radius.pill },
  dotA: { backgroundColor: colors.fail },
  dotB: { backgroundColor: colors.warn },
  dotC: { backgroundColor: colors.pass },
  title: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    color: colors.textSubtle,
    marginInlineStart: space.snug,
  },
  body: {
    margin: space.none,
    padding: space.roomy,
    overflowX: 'auto',
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    lineHeight: t.leadingRelaxed,
    color: colors.textSecondary,
    fontVariantNumeric: 'tabular-nums',
  },
  prompt: { color: colors.accentText },
  dim: { color: colors.textSubtle },
  bright: { color: colors.textPrimary },
  good: { color: colors.pass },
  bad: { color: colors.fail },
  warnTone: { color: colors.warn },
  sig: { color: colors.signalBright },
});

export type Line = {
  text: string;
  tone?: 'prompt' | 'dim' | 'bright' | 'good' | 'bad' | 'warn' | 'signal';
};

const TONE = {
  prompt: styles.prompt,
  dim: styles.dim,
  bright: styles.bright,
  good: styles.good,
  bad: styles.bad,
  warn: styles.warnTone,
  signal: styles.sig,
} as const;

export function Terminal({ title, lines }: { title?: string; lines: Line[] }) {
  return (
    <div {...stylex.props(styles.frame)}>
      <div {...stylex.props(styles.bar)}>
        <span {...stylex.props(styles.dot, styles.dotA)} />
        <span {...stylex.props(styles.dot, styles.dotB)} />
        <span {...stylex.props(styles.dot, styles.dotC)} />
        {title ? <span {...stylex.props(styles.title)}>{title}</span> : null}
      </div>
      <pre {...stylex.props(styles.body)}>
        {lines.map((l, i) => (
          <span key={i} {...stylex.props(l.tone ? TONE[l.tone] : null)}>
            {l.text}
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}
