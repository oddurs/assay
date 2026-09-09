import * as stylex from '@stylexjs/stylex';
import { colors } from './tokens.stylex';

const styles = stylex.create({
  button: {
    backgroundColor: { default: colors.accent, ':hover': colors.text },
    padding: '8px',
  },
  label: { color: colors.text },
  gone: { color: colors.accent },
});
