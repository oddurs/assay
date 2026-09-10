import * as stylex from '@stylexjs/stylex';
import { defineVariants } from '@stylegraph/variants';
import { c } from './t.stylex';

const styles = stylex.create({
  base: { color: c.ink },
  sm: { padding: '4px' },
  md: { padding: '8px' },
  quiet: { backgroundColor: c.paper },
  loud: { backgroundColor: c.ink },
});

export const button = defineVariants({
  base: styles.base,
  variants: {
    size: { sm: styles.sm, md: styles.md },
    tone: { quiet: styles.quiet, loud: styles.loud },
  },
  defaultVariants: { size: 'md', tone: 'quiet' },
});
