import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';

/**
 * Deliberately not a syntax highlighter. Three semantic tints, applied by a
 * tiny tokenizer, so the code blocks stay on the design system's palette
 * instead of importing someone else's theme.
 */
const styles = stylex.create({
  frame: {
    backgroundColor: colors.bgSunken,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.round,
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
    backgroundColor: colors.bgSurface,
  },
  name: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    color: colors.textSubtle,
  },
  pre: {
    margin: space.none,
    padding: space.gutter,
    overflowX: 'auto',
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    lineHeight: t.leadingRelaxed,
    color: colors.textSecondary,
    tabSize: 2,
  },
  comment: { color: colors.textSubtle },
  keyword: { color: colors.accentText },
  string: { color: colors.signalBright },
  token: { color: colors.pass },
});

const KEYWORDS =
  /\b(import|from|export|const|let|return|function|type|as|default|await|async|new|interface)\b/;

function tint(line: string, i: number) {
  const trimmed = line.trimStart();
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('/*')
  ) {
    return (
      <span key={i} {...stylex.props(styles.comment)}>
        {line}
        {'\n'}
      </span>
    );
  }
  const parts = line.split(/('[^']*'|"[^"]*"|`[^`]*`)/g);
  return (
    <span key={i}>
      {parts.map((part, j) => {
        if (/^['"`]/.test(part)) {
          return (
            <span key={j} {...stylex.props(styles.string)}>
              {part}
            </span>
          );
        }
        const words = part.split(/(\s+)/);
        return (
          <span key={j}>
            {words.map((w, k) =>
              KEYWORDS.test(w) ? (
                <span key={k} {...stylex.props(styles.keyword)}>
                  {w}
                </span>
              ) : /^(palette|colors|space|type|radius|stroke|elevation|motion|layer|scale|size|font|curve)\./.test(
                  w,
                ) ? (
                <span key={k} {...stylex.props(styles.token)}>
                  {w}
                </span>
              ) : (
                <span key={k}>{w}</span>
              ),
            )}
          </span>
        );
      })}
      {'\n'}
    </span>
  );
}

export function Code({ filename, children }: { filename?: string; children: string }) {
  const lines = children.replace(/\n$/, '').split('\n');
  return (
    <div {...stylex.props(styles.frame)}>
      {filename ? (
        <div {...stylex.props(styles.bar)}>
          <span {...stylex.props(styles.name)}>{filename}</span>
        </div>
      ) : null}
      <pre {...stylex.props(styles.pre)}>{lines.map(tint)}</pre>
    </div>
  );
}
