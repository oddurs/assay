import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { stroke } from '../tokens/shape.stylex';
import { Container } from './Container';
import { Text } from './Text';

const styles = stylex.create({
  root: { paddingBlock: space.chapter, position: 'relative' },
  tight: { paddingBlock: space.bay },
  ruled: {
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  sunken: { backgroundColor: colors.bgSunken },
  head: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.cozy,
    maxWidth: '680px',
    marginBottom: space.bay,
  },
});

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tight,
  ruled,
  sunken,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  children: ReactNode;
  tight?: boolean;
  ruled?: boolean;
  sunken?: boolean;
}) {
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
      <Container>
        {(eyebrow || title || intro) && (
          <header {...stylex.props(styles.head)}>
            {eyebrow ? <Text role="eyebrow">{eyebrow}</Text> : null}
            {title ? <Text role="display">{title}</Text> : null}
            {intro ? <Text role="lead">{intro}</Text> : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
