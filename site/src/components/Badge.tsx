import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.tight,
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    fontWeight: t.weightMedium,
    letterSpacing: t.trackingLabel,
    lineHeight: t.leadingSnug,
    textTransform: 'uppercase',
    paddingBlock: space.tight,
    paddingInline: space.snug,
    borderRadius: radius.pill,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    whiteSpace: 'nowrap',
  },
  neutral: { color: colors.textMuted, borderColor: colors.border, backgroundColor: colors.bgRaised },
  accent: { color: colors.accentText, borderColor: colors.accentSubtle, backgroundColor: colors.bgRaised },
  signal: { color: colors.signalBright, borderColor: colors.signal, backgroundColor: colors.bgRaised },
  pass: { color: colors.pass, borderColor: colors.pass, backgroundColor: colors.bgRaised },
  warn: { color: colors.warn, borderColor: colors.warn, backgroundColor: colors.bgRaised },
  fail: { color: colors.fail, borderColor: colors.fail, backgroundColor: colors.bgRaised },
});

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'signal' | 'pass' | 'warn' | 'fail';
}) {
  return <span {...stylex.props(styles.base, styles[tone])}>{children}</span>;
}
