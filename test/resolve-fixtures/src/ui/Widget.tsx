import * as stylex from '@stylexjs/stylex';
import { vars } from '@/theme/vars.stylex';

const styles = stylex.create({
  box: {
    color: vars['--color-fg'], // token, via alias + computed key
    padding: vars['--space-md'], // token
    borderRadius: '4px', // literal
  },
});
