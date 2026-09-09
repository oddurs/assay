import * as stylex from '@stylexjs/stylex';
import { colors } from './tokens.stylex';


// Moved down two lines: line numbers change, styles do not.
const styles = stylex.create({
  button: {
    backgroundColor: { default: colors.accent, ':hover': colors.text },
    padding: '8px',
  },
  label: { color: colors.text, fontSize: '14px' },
  added: { color: colors.accent },
});
