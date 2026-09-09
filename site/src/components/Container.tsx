import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { space } from '../tokens/space.stylex';
import { colors } from '../tokens/color.stylex';
import { stroke } from '../tokens/shape.stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    maxWidth: '1140px',
    marginInline: 'auto',
    paddingInline: space.roomy,
  },
  narrow: { maxWidth: '760px' },
  // Vertical hairlines that frame the column. They give the page an edge to
  // hang against, which is what stops a wide dark layout drifting.
  framed: {
    borderInlineWidth: stroke.hair,
    borderInlineStyle: 'solid',
    borderInlineColor: colors.gridLine,
  },
});

export function Container({
  children,
  narrow,
  framed,
  style,
}: {
  children: ReactNode;
  narrow?: boolean;
  framed?: boolean;
  style?: stylex.StyleXStyles;
}) {
  return (
    <div
      {...stylex.props(
        styles.root,
        narrow && styles.narrow,
        framed && styles.framed,
        style,
      )}
    >
      {children}
    </div>
  );
}
