import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { stroke } from '../tokens/shape.stylex';
import { Container } from './Container';
import { Text } from './Text';
import { Statement } from './Statement';
import { GridField } from './GridField';

const styles = stylex.create({
  root: { paddingBlock: space.chapter, position: 'relative', overflow: 'hidden' },
  tight: { paddingBlock: space.bay },
  ruled: {
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  sunken: { backgroundColor: colors.bgSunken },
  inner: { position: 'relative' },
  // Title left, supporting prose right — the header itself is a two-column
  // grid rather than a stack, so the page has more than one rhythm.
  head: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1.35fr) minmax(0, 1fr)',
      '@media (max-width: 860px)': '1fr',
    },
    gap: space.roomy,
    alignItems: 'end',
    marginBottom: space.bay,
  },
  headStacked: { gridTemplateColumns: '1fr', maxWidth: '820px' },
  titleCol: { display: 'flex', flexDirection: 'column', gap: space.cozy },
  asideCol: { display: 'flex', flexDirection: 'column', gap: space.snug },
});

export function Section({
  id,
  eyebrow,
  title,
  tail,
  intro,
  aside,
  children,
  tight,
  ruled,
  sunken,
  grid,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  /** The muted continuation of the title — see Statement. */
  tail?: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  tight?: boolean;
  ruled?: boolean;
  sunken?: boolean;
  grid?: 'top' | 'centre' | 'side';
}) {
  const hasHead = eyebrow || title || intro || aside;
  return (
    <section
      id={id}
      {...stylex.props(
        styles.root,
        tight && styles.tight,
        ruled && styles.ruled,
        sunken && styles.sunken,
      )}
    >
      {grid ? <GridField fade={grid} /> : null}
      <Container style={styles.inner}>
        {hasHead && (
          <header {...stylex.props(styles.head, !aside && styles.headStacked)}>
            <div {...stylex.props(styles.titleCol)}>
              {eyebrow ? <Text role="eyebrow">{eyebrow}</Text> : null}
              {title ? (
                <Statement scale="display" tail={tail}>
                  {title}
                </Statement>
              ) : null}
              {intro && !aside ? <Text role="lead">{intro}</Text> : null}
            </div>
            {aside ? <div {...stylex.props(styles.asideCol)}>{aside}</div> : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
