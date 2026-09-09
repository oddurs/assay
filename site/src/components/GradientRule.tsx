import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';

/**
 * A hairline that fades in and out along its length. Used where a hard rule
 * across the full width would cut the page into slabs — the fade lets a
 * section end without a hard stop.
 */
const styles = stylex.create({
  root: { height: space.hair, width: '100%' },
  neutral: {
    backgroundImage: `linear-gradient(90deg, transparent, ${colors.border} 18%, ${colors.border} 82%, transparent)`,
  },
  lit: {
    backgroundImage: `linear-gradient(90deg, transparent, ${colors.gradientFrom} 22%, ${colors.gradientVia} 50%, ${colors.gradientTo} 78%, transparent)`,
    opacity: 0.55,
  },
});

export function GradientRule({ tone = 'neutral' }: { tone?: 'neutral' | 'lit' }) {
  return <div aria-hidden {...stylex.props(styles.root, styles[tone])} />;
}
