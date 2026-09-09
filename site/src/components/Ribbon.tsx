import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { blur } from '../tokens/shape.stylex';
import { layer } from '../tokens/motion.stylex';

/**
 * The gradient ribbon.
 *
 * Deliberately HARD-EDGED. A diffuse radial blur is the default every dark
 * landing page reaches for and it reads as fog; a ribbon has a silhouette, so
 * it reads as a made object. One blurred band sits behind the crisp ones to
 * give the stack depth without softening the edge that carries the shape.
 *
 * Every stop is a design token via `stopColor`, so the ribbon re-lights on a
 * theme change along with everything else — and so our own tool scores it.
 */
const styles = stylex.create({
  root: {
    position: 'absolute',
    insetBlockStart: space.none,
    insetInlineEnd: space.none,
    height: '100%',
    width: { default: '46%', '@media (max-width: 860px)': '100%' },
    opacity: { default: 1, '@media (max-width: 860px)': 0.45 },
    pointerEvents: 'none',
    zIndex: layer.base,
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    insetBlock: space.none,
    insetInline: space.none,
    width: '100%',
    height: '100%',
  },
  soft: { filter: `blur(${blur.ambient})`, opacity: 0.7 },
  stopWarm: { stopColor: colors.gradientWarm },
  stopFrom: { stopColor: colors.gradientFrom },
  stopVia: { stopColor: colors.gradientVia },
  stopTo: { stopColor: colors.gradientTo },
  // The ribbon meets the page on a hairline rather than just ending.
  seam: {
    position: 'absolute',
    insetBlock: space.none,
    insetInlineStart: space.none,
    width: space.hair,
    backgroundImage: `linear-gradient(180deg, transparent, ${colors.glassEdge}, transparent)`,
  },
});

export function Ribbon() {
  return (
    <div aria-hidden {...stylex.props(styles.root)}>
      <svg
        {...stylex.props(styles.svg, styles.soft)}
        viewBox="0 0 600 800"
        preserveAspectRatio="xMaxYMid slice"
      >
        <defs>
          <linearGradient id="ribbonSoft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" {...stylex.props(styles.stopWarm)} />
            <stop offset="0.55" {...stylex.props(styles.stopVia)} />
            <stop offset="1" {...stylex.props(styles.stopTo)} />
          </linearGradient>
        </defs>
        <path
          d="M600 -60 C 420 120, 380 340, 470 560 C 520 690, 560 760, 600 820 Z"
          fill="url(#ribbonSoft)"
        />
      </svg>

      <svg
        {...stylex.props(styles.svg)}
        viewBox="0 0 600 800"
        preserveAspectRatio="xMaxYMid slice"
      >
        <defs>
          <linearGradient id="ribbonA" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0" {...stylex.props(styles.stopWarm)} />
            <stop offset="0.42" {...stylex.props(styles.stopFrom)} />
            <stop offset="1" {...stylex.props(styles.stopVia)} />
          </linearGradient>
          <linearGradient id="ribbonB" x1="0" y1="0.1" x2="1" y2="0.9">
            <stop offset="0" {...stylex.props(styles.stopFrom)} />
            <stop offset="0.5" {...stylex.props(styles.stopVia)} />
            <stop offset="1" {...stylex.props(styles.stopTo)} />
          </linearGradient>
          <linearGradient id="ribbonC" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" {...stylex.props(styles.stopVia)} />
            <stop offset="1" {...stylex.props(styles.stopTo)} />
          </linearGradient>
        </defs>

        <path
          d="M600 -80 C 470 90, 405 300, 452 520 C 486 676, 548 772, 600 840 Z"
          fill="url(#ribbonA)"
        />
        <path
          d="M600 40 C 500 190, 462 372, 512 560 C 544 682, 578 760, 600 806 Z"
          fill="url(#ribbonB)"
          opacity="0.85"
        />
        <path
          d="M600 200 C 546 300, 524 430, 556 570 C 574 650, 590 706, 600 744 Z"
          fill="url(#ribbonC)"
          opacity="0.7"
        />
      </svg>

      <div {...stylex.props(styles.seam)} />
    </div>
  );
}
