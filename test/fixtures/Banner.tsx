import * as stylex from '@stylexjs/stylex';
import { colors, space } from './tokens.stylex';

const styles = stylex.create({
  banner: {
    color: { default: colors.fg, ':hover': '#B01455' }, // token + literal · color
    paddingBlock: space.lg, // token   · space
    fontSize: '14px', // literal · type
    position: 'relative', // untokenizable
  },
  sized: (h) => ({
    height: h, // untokenizable
    marginTop: h, // dynamic · space
    color: colors.accent, // token   · color
  }),
});
