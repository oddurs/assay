import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { stroke } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import { Logo } from '../components/Logo';
import report from '../generated/report.json';

const styles = stylex.create({
  root: {
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    paddingBlock: space.bay,
    backgroundColor: colors.bgSunken,
  },
  top: {
    display: 'flex',
    gap: space.bay,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBlockEnd: space.bay,
  },
  brand: { display: 'flex', flexDirection: 'column', gap: space.snug, maxWidth: '320px' },
  cols: { display: 'flex', gap: space.bay, flexWrap: 'wrap' },
  col: { display: 'flex', flexDirection: 'column', gap: space.snug },
  head: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingLabel,
    textTransform: 'uppercase',
    color: colors.textSubtle,
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
  bottom: {
    display: 'flex',
    gap: space.gutter,
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingBlockStart: space.gutter,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  stamp: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textSubtle,
    marginInlineStart: 'auto',
    fontVariantNumeric: 'tabular-nums',
  },
});

const COLS = [
  { head: 'Product', links: ['What it measures', 'Graph format', 'Roadmap', 'Changelog'] },
  { head: 'Docs', links: ['Install', 'Taxonomy', 'CI setup', 'Config reference'] },
  { head: 'Project', links: ['GitHub', 'Discussions', 'Licence · MIT'] },
];

export function Footer() {
  return (
    <footer {...stylex.props(styles.root)}>
      <Container>
        <div {...stylex.props(styles.top)}>
          <div {...stylex.props(styles.brand)}>
            <Logo />
            <Text role="caption">
              Compile-time design system conformance for StyleX. Free and MIT, because it only
              works if it is in everyone&rsquo;s build.
            </Text>
          </div>
          <div {...stylex.props(styles.cols)}>
            {COLS.map((c) => (
              <div key={c.head} {...stylex.props(styles.col)}>
                <span {...stylex.props(styles.head)}>{c.head}</span>
                {c.links.map((l) => (
                  <a key={l} href="#top" {...stylex.props(styles.link)}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div {...stylex.props(styles.bottom)}>
          <Text role="caption">
            Built with StyleX. Measured by Assay on every build.
          </Text>
          <span {...stylex.props(styles.stamp)}>
            {(report.score * 100).toFixed(1)}% · {report.token}/{report.scored} · {report.files} files
          </span>
        </div>
      </Container>
    </footer>
  );
}
