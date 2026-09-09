import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { layer } from '../tokens/motion.stylex';

/**
 * The hairline grid.
 *
 * Graph paper is the native material of a measurement tool, so the grid is
 * structure rather than decoration — it steps on `space.cell` so every field on
 * the page shares one rhythm, and it is always masked, because an unmasked grid
 * to the edge of the viewport reads as a wireframe rather than a ground.
 */
const styles = stylex.create({
  root: {
    position: 'absolute',
    insetBlock: space.none,
    insetInline: space.none,
    pointerEvents: 'none',
    zIndex: layer.base,
    backgroundImage: `linear-gradient(${colors.gridLine} ${'1px'}, transparent ${'1px'}), linear-gradient(90deg, ${colors.gridLine} ${'1px'}, transparent ${'1px'})`,
    backgroundSize: `${space.cell} ${space.cell}`,
  },
  fadeTop: {
    maskImage: 'radial-gradient(ellipse 85% 70% at 50% 0%, black 30%, transparent 75%)',
    WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 0%, black 30%, transparent 75%)',
  },
  fadeCentre: {
    maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 80%)',
  },
  fadeSide: {
    maskImage: 'linear-gradient(90deg, transparent, black 40%, black 60%, transparent)',
    WebkitMaskImage: 'linear-gradient(90deg, transparent, black 40%, black 60%, transparent)',
  },
});

export function GridField({ fade = 'top' }: { fade?: 'top' | 'centre' | 'side' }) {
  return (
    <div
      aria-hidden
      {...stylex.props(
        styles.root,
        fade === 'top' && styles.fadeTop,
        fade === 'centre' && styles.fadeCentre,
        fade === 'side' && styles.fadeSide,
      )}
    />
  );
}
