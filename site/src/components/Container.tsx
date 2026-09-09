import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { space } from '../tokens/space.stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    maxWidth: '1140px',
    marginInline: 'auto',
    paddingInline: space.roomy,
  },
  narrow: { maxWidth: '760px' },
});

export function Container({
  children,
  narrow,
  style,
}: {
  children: ReactNode;
  narrow?: boolean;
  style?: stylex.StyleXStyles;
}) {
  return (
    <div {...stylex.props(styles.root, narrow && styles.narrow, style)}>
      {children}
    </div>
  );
}
