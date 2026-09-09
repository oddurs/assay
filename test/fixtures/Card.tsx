import * as stylex from '@stylexjs/stylex';
import { colors, space } from './tokens.stylex';

export function Card({ children }) {
  return <div {...stylex.props(styles.card)}>{children}</div>;
}

const styles = stylex.create({
  card: {
    display: 'flex', // untokenizable
    flexDirection: 'column', // untokenizable
    padding: space.md, // token   · space
    gap: space.sm, // token   · space
    color: colors.fg, // token   · color
    backgroundColor: '#fff', // literal · color
    borderRadius: '6px', // literal · radius
    boxShadow: '0 1px 2px rgba(0,0,0,.06)', // literal · shadow
    borderWidth: 0, // neutral · zero
    borderColor: 'transparent', // neutral · keyword
  },
});
