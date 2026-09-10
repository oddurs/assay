import { useState, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke, blur } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';

/**
 * A command you can actually take. Printing `npx stylegraph .` and making the reader
 * retype it is the smallest possible failure of a developer landing page.
 */
const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.snug,
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    color: colors.textSecondary,
    backgroundColor: colors.glassFill,
    backdropFilter: `blur(${blur.glass})`,
    WebkitBackdropFilter: `blur(${blur.glass})`,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: { default: colors.glassEdge, ':hover': colors.borderStrong },
    borderRadius: radius.pill,
    paddingBlock: space.snug,
    paddingInlineStart: space.gutter,
    paddingInlineEnd: space.snug,
    cursor: 'pointer',
    transitionProperty: 'border-color, background-color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
  prompt: { color: colors.accentText },
  cmd: { color: colors.textPrimary },
  note: { color: colors.textSubtle, marginInlineStart: space.tight },
  action: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    textTransform: 'uppercase',
    color: colors.textSubtle,
    backgroundColor: colors.glassFill,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.glassEdge,
    borderRadius: radius.pill,
    paddingBlock: space.hair,
    paddingInline: space.snug,
    marginInlineStart: space.snug,
  },
  copied: { color: colors.pass, borderColor: colors.pass },
});

export function CopyField({ command, note }: { command: string; note?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(command).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => setCopied(false),
    );
  }, [command]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${command} to the clipboard`}
      {...stylex.props(styles.root)}
    >
      <span {...stylex.props(styles.prompt)} aria-hidden>
        $
      </span>
      <span {...stylex.props(styles.cmd)}>{command}</span>
      {note ? <span {...stylex.props(styles.note)}>{note}</span> : null}
      <span
        {...stylex.props(styles.action, copied && styles.copied)}
        aria-live="polite"
      >
        {copied ? 'copied' : 'copy'}
      </span>
    </button>
  );
}
