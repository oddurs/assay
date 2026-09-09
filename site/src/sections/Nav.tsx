import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { stroke } from '../tokens/shape.stylex';
import { motion, layer } from '../tokens/motion.stylex';
import { Container } from '../components/Container';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';

const styles = stylex.create({
  root: {
    position: 'sticky',
    insetBlockStart: space.none,
    zIndex: layer.sticky,
    backgroundColor: colors.bgBase,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: space.roomy,
    paddingBlock: space.cozy,
  },
  links: {
    display: { default: 'flex', '@media (max-width: 860px)': 'none' },
    alignItems: 'center',
    gap: space.gutter,
    marginInlineStart: space.gutter,
  },
  link: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    fontWeight: t.weightMedium,
    color: { default: colors.textMuted, ':hover': colors.textPrimary },
    textDecoration: 'none',
    transitionProperty: 'color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
  right: { marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: space.snug },
});

const LINKS = [
  { href: '#gap', label: 'Why' },
  { href: '#measures', label: 'What it measures' },
  { href: '#dogfood', label: 'This site' },
  { href: '#system', label: 'Design system' },
  { href: '#roadmap', label: 'Roadmap' },
];

export function Nav() {
  return (
    <nav {...stylex.props(styles.root)}>
      <Container>
        <div {...stylex.props(styles.inner)}>
          <Logo />
          <div {...stylex.props(styles.links)}>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} {...stylex.props(styles.link)}>
                {l.label}
              </a>
            ))}
          </div>
          <div {...stylex.props(styles.right)}>
            <Button href="#install" variant="secondary">
              Get started
            </Button>
          </div>
        </div>
      </Container>
    </nav>
  );
}
