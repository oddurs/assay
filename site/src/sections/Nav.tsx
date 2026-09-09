import { useMemo } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke, blur } from '../tokens/shape.stylex';
import { motion, layer } from '../tokens/motion.stylex';
import { Container } from '../components/Container';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { useActiveSection, useScrolled } from '../hooks/useActiveSection';
import report from '../generated/report.json';

const LINKS = [
  { href: 'gap', label: 'Why' },
  { href: 'measures', label: 'What it measures' },
  { href: 'dogfood', label: 'This site' },
  { href: 'system', label: 'Design system' },
  { href: 'roadmap', label: 'Roadmap' },
];

const styles = stylex.create({
  root: {
    position: 'sticky',
    insetBlockStart: space.none,
    zIndex: layer.sticky,
    transitionProperty: 'background-color, border-color, backdrop-filter',
    transitionDuration: motion.smooth,
    transitionTimingFunction: motion.easeStandard,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
  },
  // At the top the nav is part of the hero; once you scroll it becomes a
  // glass shelf so content passes UNDER it rather than colliding with it.
  scrolled: {
    backgroundColor: colors.scrim,
    backdropFilter: `blur(${blur.veil})`,
    WebkitBackdropFilter: `blur(${blur.veil})`,
    borderBottomColor: colors.border,
  },
  inner: { display: 'flex', alignItems: 'center', gap: space.gutter, paddingBlock: space.cozy },
  links: {
    display: { default: 'flex', '@media (max-width: 1040px)': 'none' },
    alignItems: 'center',
    gap: space.tight,
    marginInlineStart: space.snug,
  },
  link: {
    position: 'relative',
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    fontWeight: t.weightMedium,
    color: { default: colors.textMuted, ':hover': colors.textPrimary },
    textDecoration: 'none',
    paddingBlock: space.tight,
    paddingInline: space.snug,
    borderRadius: radius.soft,
    backgroundColor: { default: 'transparent', ':hover': colors.glassFill },
    transitionProperty: 'color, background-color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
  linkActive: { color: colors.textPrimary, backgroundColor: colors.glassFill },
  // The active marker is a rule under the label, not a pill, so the nav keeps
  // its horizontal line and does not turn into a row of buttons.
  marker: {
    position: 'absolute',
    insetBlockEnd: space.none,
    insetInlineStart: space.snug,
    insetInlineEnd: space.snug,
    height: stroke.bold,
    borderRadius: radius.pill,
    backgroundColor: colors.signal,
  },
  right: { marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: space.snug },
  // A free MIT tool's real destination is the repository, so it gets the
  // strongest affordance and carries a live figure rather than a bare word.
  repo: {
    display: { default: 'inline-flex', '@media (max-width: 620px)': 'none' },
    alignItems: 'center',
    gap: space.snug,
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: { default: colors.textMuted, ':hover': colors.textPrimary },
    textDecoration: 'none',
    paddingBlock: space.tight,
    paddingInline: space.snug,
    borderRadius: radius.pill,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: { default: colors.border, ':hover': colors.borderStrong },
    transitionProperty: 'color, border-color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
  score: { color: colors.pass, fontVariantNumeric: 'tabular-nums' },
  divider: { width: stroke.hair, height: space.roomy, backgroundColor: colors.border },
  // Below the desktop breakpoint the links become a scrollable rail instead of
  // disappearing, which is what they did before.
  rail: {
    display: { default: 'none', '@media (max-width: 1040px)': 'flex' },
    gap: space.tight,
    overflowX: 'auto',
    paddingBlockEnd: space.tight,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    paddingBlockStart: space.snug,
  },
  railLink: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    color: { default: colors.textMuted, ':hover': colors.textPrimary },
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    paddingInline: space.snug,
    paddingBlock: space.tight,
    borderRadius: radius.soft,
  },
  railActive: { color: colors.textPrimary, backgroundColor: colors.glassFill },
});

export function Nav() {
  const ids = useMemo(() => LINKS.map((l) => l.href), []);
  const active = useActiveSection(ids);
  const scrolled = useScrolled();

  return (
    <nav {...stylex.props(styles.root, scrolled && styles.scrolled)}>
      <Container>
        <div {...stylex.props(styles.inner)}>
          <Logo />
          <div {...stylex.props(styles.links)}>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={`#${l.href}`}
                aria-current={active === l.href ? 'true' : undefined}
                {...stylex.props(styles.link, active === l.href && styles.linkActive)}
              >
                {l.label}
                {active === l.href ? <span {...stylex.props(styles.marker)} /> : null}
              </a>
            ))}
          </div>
          <div {...stylex.props(styles.right)}>
            <a href="#install" {...stylex.props(styles.repo)}>
              <span>this page</span>
              <span {...stylex.props(styles.score)}>{(report.score * 100).toFixed(1)}%</span>
            </a>
            <span {...stylex.props(styles.divider)} aria-hidden />
            <Button href="#install" variant="secondary" chevron>
              Get the CLI
            </Button>
          </div>
        </div>
        <div {...stylex.props(styles.rail)}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={`#${l.href}`}
              {...stylex.props(styles.railLink, active === l.href && styles.railActive)}
            >
              {l.label}
            </a>
          ))}
        </div>
      </Container>
    </nav>
  );
}
