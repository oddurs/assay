import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke, blur } from '../tokens/shape.stylex';
import { motion, layer } from '../tokens/motion.stylex';
import { Container } from '../components/Container';
import { Logo } from '../components/Logo';
import packages from '../generated/packages.json';

/**
 * The family rail. Every page carries the whole family, so a reader who lands
 * deep on one package can see the rest without going back to the index.
 */
const styles = stylex.create({
  root: {
    position: 'sticky',
    insetBlockStart: space.none,
    zIndex: layer.sticky,
    backgroundColor: colors.scrim,
    backdropFilter: `blur(${blur.veil})`,
    WebkitBackdropFilter: `blur(${blur.veil})`,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: space.gutter,
    paddingBlock: space.cozy,
  },
  rail: {
    display: 'flex',
    gap: space.tight,
    overflowX: 'auto',
    paddingBlockEnd: space.snug,
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.tight,
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: { default: colors.textMuted, ':hover': colors.textPrimary },
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    paddingBlock: space.tight,
    paddingInline: space.snug,
    borderRadius: radius.soft,
    backgroundColor: { default: 'transparent', ':hover': colors.glassFill },
    transitionProperty: 'color, background-color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
  current: { color: colors.textPrimary, backgroundColor: colors.glassFill },
  // Status is a shape, not just a colour: a reader should not need to know the
  // palette to tell written from scaffolded.
  pip: { width: space.tight, height: space.tight, borderRadius: radius.pill },
  written: { backgroundColor: colors.pass },
  scaffold: { backgroundColor: colors.textSubtle },
  home: { marginInlineEnd: 'auto' },
});

export function FamilyNav({ current }: { current: string }) {
  // packages already includes spec — it is the package that implements the
  // format, not a separate thing.
  const items = packages.map((p) => ({
    slug: p.name,
    label: p.name,
    written: p.written,
  }));

  return (
    <nav {...stylex.props(styles.root)} aria-label="stylegraph packages">
      <Container>
        <div {...stylex.props(styles.top)}>
          <span {...stylex.props(styles.home)}>
            <Logo href="../" />
          </span>
        </div>
        <div {...stylex.props(styles.rail)}>
          {items.map((it) => (
            <a
              key={it.slug}
              href={`../${it.slug}/`}
              aria-current={it.slug === current ? 'page' : undefined}
              {...stylex.props(styles.link, it.slug === current && styles.current)}
            >
              <span
                {...stylex.props(
                  styles.pip,
                  it.written ? styles.written : styles.scaffold,
                )}
                aria-hidden
              />
              {it.label}
            </a>
          ))}
        </div>
      </Container>
    </nav>
  );
}
