import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { layer } from '../tokens/motion.stylex';

/**
 * The atmospheric layer. Three soft gradient fields built entirely from the
 * gradient role tokens — so switching theme re-lights the whole page, not
 * just the buttons.
 */
const styles = stylex.create({
  root: {
    position: 'absolute',
    insetBlock: space.none,
    insetInline: space.none,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: layer.base,
  },
  field: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    opacity: 0.5,
  },
  a: {
    insetBlockStart: '-24%',
    insetInlineStart: '-8%',
    width: '58%',
    height: '78%',
    backgroundImage: `radial-gradient(closest-side, ${colors.gradientVia}, transparent)`,
  },
  b: {
    insetBlockStart: '-32%',
    insetInlineEnd: '-10%',
    width: '52%',
    height: '82%',
    backgroundImage: `radial-gradient(closest-side, ${colors.gradientFrom}, transparent)`,
    opacity: 0.38,
  },
  c: {
    insetBlockStart: '18%',
    insetInlineStart: '32%',
    width: '44%',
    height: '60%',
    backgroundImage: `radial-gradient(closest-side, ${colors.gradientTo}, transparent)`,
    opacity: 0.22,
  },
  grid: {
    position: 'absolute',
    insetBlock: space.none,
    insetInline: space.none,
    backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
    backgroundSize: '72px 72px',
    opacity: 0.5,
    maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black, transparent)',
    WebkitMaskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black, transparent)',
  },
});

export function Glow({ grid = true }: { grid?: boolean }) {
  return (
    <div aria-hidden {...stylex.props(styles.root)}>
      {grid ? <div {...stylex.props(styles.grid)} /> : null}
      <div {...stylex.props(styles.field, styles.a)} />
      <div {...stylex.props(styles.field, styles.b)} />
      <div {...stylex.props(styles.field, styles.c)} />
    </div>
  );
}
