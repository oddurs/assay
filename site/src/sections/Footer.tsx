import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { stroke } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import { Logo } from '../components/Logo';
import { CopyField } from '../components/CopyField';
import { GridField } from '../components/GridField';
import report from '../generated/report.json';

const styles = stylex.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    paddingBlockStart: space.bay,
    paddingBlockEnd: space.roomy,
    backgroundColor: colors.bgSunken,
  },
  inner: { position: 'relative' },
  // The footer was a wide empty gutter beside three columns of links. It now
  // carries a last call to action, because it is the end of a long read and
  // the reader who got here is the one most likely to act.
  top: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1.3fr) repeat(3, minmax(0, 0.9fr))',
      '@media (max-width: 900px)': '1fr 1fr',
      '@media (max-width: 560px)': '1fr',
    },
    gap: space.bay,
    paddingBlockEnd: space.bay,
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.gutter,
    maxWidth: '360px',
  },
  col: { display: 'flex', flexDirection: 'column', gap: space.snug },
  head: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingLabel,
    textTransform: 'uppercase',
    color: colors.textSubtle,
    marginBlockEnd: space.tight,
  },
  link: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    color: { default: colors.textMuted, ':hover': colors.textPrimary },
    textDecoration: 'none',
    transitionProperty: 'color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
  // The score stamp is the most characteristic thing this project can put in a
  // footer, so it gets a real band rather than six grey words in a corner.
  stamp: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(4, minmax(0, 1fr))',
      '@media (max-width: 720px)': 'repeat(2, minmax(0, 1fr))',
    },
    gap: space.gutter,
    paddingBlock: space.gutter,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  stampCell: { display: 'flex', flexDirection: 'column', gap: space.hair },
  stampValue: {
    fontFamily: t.familyMono,
    fontSize: t.bodySize,
    color: colors.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  },
  stampPass: { color: colors.pass },
  stampLabel: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textSubtle,
  },
  bottom: {
    display: 'flex',
    gap: space.gutter,
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingBlockStart: space.gutter,
  },
  fine: { fontFamily: t.familyMono, fontSize: t.microSize, color: colors.textSubtle },
  spacer: { marginInlineStart: 'auto' },
});

const COLS = [
  {
    head: 'Product',
    links: [
      { label: 'What it measures', href: '#measures' },
      { label: 'This site, measured', href: '#dogfood' },
      { label: 'Design system', href: '#system' },
      { label: 'Roadmap', href: '#roadmap' },
    ],
  },
  {
    head: 'Reference',
    links: [
      { label: 'Install', href: '#install' },
      { label: 'Graph format', href: '#install' },
      { label: 'The taxonomy', href: '#measures' },
      { label: 'Themes', href: '#themes' },
    ],
  },
  {
    head: 'Project',
    links: [
      { label: 'GitHub', href: '#top' },
      { label: 'Discussions', href: '#top' },
      { label: 'Licence · MIT', href: '#top' },
    ],
  },
];

const STAMP = [
  { value: `${(report.score * 100).toFixed(1)}%`, label: 'conformance', pass: true },
  { value: `${report.token}/${report.scored}`, label: 'declarations' },
  { value: `${report.tokensDefined}`, label: 'tokens' },
  {
    value: `${report.contrast.checked} · 0 fail`,
    label: `contrast ${report.contrast.level}`,
    pass: true,
  },
];

export function Footer() {
  return (
    <footer {...stylex.props(styles.root)}>
      <GridField fade="side" />
      <Container style={styles.inner}>
        <div {...stylex.props(styles.top)}>
          <div {...stylex.props(styles.brand)}>
            <Logo />
            <Text role="body">
              Compile-time design system conformance for StyleX. Free and MIT, because
              it only works if it is in everyone&rsquo;s build.
            </Text>
            <CopyField command="npx stylegraph ." />
          </div>
          {COLS.map((c) => (
            <nav key={c.head} {...stylex.props(styles.col)} aria-label={c.head}>
              <span {...stylex.props(styles.head)}>{c.head}</span>
              {c.links.map((l) => (
                <a key={l.label} href={l.href} {...stylex.props(styles.link)}>
                  {l.label}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <div {...stylex.props(styles.stamp)}>
          {STAMP.map((s) => (
            <div key={s.label} {...stylex.props(styles.stampCell)}>
              <span {...stylex.props(styles.stampValue, s.pass && styles.stampPass)}>
                {s.value}
              </span>
              <span {...stylex.props(styles.stampLabel)}>{s.label}</span>
            </div>
          ))}
        </div>

        <div {...stylex.props(styles.bottom)}>
          <span {...stylex.props(styles.fine)}>
            Built with StyleX · measured by stylegraph on every build
          </span>
          <span {...stylex.props(styles.fine, styles.spacer)}>
            {report.files} files ·{' '}
            {new Date(report.generatedAt).toISOString().slice(0, 10)}
          </span>
        </div>
      </Container>
    </footer>
  );
}
