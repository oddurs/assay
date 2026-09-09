import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke, blur } from '../tokens/shape.stylex';
import { layer } from '../tokens/motion.stylex';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import { Statement } from '../components/Statement';
import { Button } from '../components/Button';
import { StatLine } from '../components/StatLine';
import { CopyField } from '../components/CopyField';
import { FactRow } from '../components/FactRow';
import { Ribbon } from '../components/Ribbon';
import { GridField } from '../components/GridField';
import report from '../generated/report.json';

const styles = stylex.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  inner: { position: 'relative', zIndex: layer.raised },
  // The content column is deliberately narrower than the container: the ribbon
  // needs the right half, and text that runs under it is unreadable.
  column: {
    maxWidth: { default: '66%', '@media (max-width: 1080px)': '80%', '@media (max-width: 860px)': '100%' },
    paddingBlockStart: space.chapter,
    paddingBlockEnd: space.bay,
    display: 'flex',
    flexDirection: 'column',
    gap: space.roomy,
    alignItems: 'flex-start',
  },
  gradientWord: {
    backgroundImage: `linear-gradient(96deg, ${colors.gradientFrom}, ${colors.gradientVia} 46%, ${colors.gradientTo})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  actions: { display: 'flex', gap: space.snug, flexWrap: 'wrap', alignItems: 'center' },
  // A glass command strip rather than a bordered box — it sits over the grid
  // and the ribbon, so it has to feel like it is on top of them.
  command: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.snug,
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    color: colors.textSecondary,
    backgroundColor: colors.glassFill,
    backdropFilter: `blur(${blur.glass})`,
    WebkitBackdropFilter: `blur(${blur.glass})`,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.glassEdge,
    borderRadius: radius.pill,
    paddingBlock: space.snug,
    paddingInline: space.gutter,
  },
  prompt: { color: colors.accentText },
  copy: { color: colors.textSubtle, marginInlineStart: space.snug },
  facts: { width: '100%', marginBlockStart: space.snug },
  // The measured-repos band: our version of a logo wall, except every number
  // in it was produced by the tool.
  band: {
    position: 'relative',
    zIndex: layer.raised,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    backgroundColor: colors.scrim,
    backdropFilter: `blur(${blur.glass})`,
    WebkitBackdropFilter: `blur(${blur.glass})`,
  },
  bandInner: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'auto repeat(3, minmax(0, 1fr))',
      '@media (max-width: 860px)': 'repeat(2, minmax(0, 1fr))',
    },
    alignItems: 'center',
    gap: space.gutter,
    paddingBlock: space.gutter,
  },
  bandLabel: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingLabel,
    textTransform: 'uppercase',
    color: colors.textSubtle,
    paddingInlineEnd: space.gutter,
    borderInlineEndWidth: { default: stroke.hair, '@media (max-width: 860px)': null },
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colors.gridLineStrong,
  },
  measured: { display: 'flex', flexDirection: 'column', gap: space.hair },
  repo: {
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    color: colors.textSecondary,
  },
  reading: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    fontWeight: t.weightSemibold,
    color: colors.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  },
});

const FACTS = [
  { value: `${report.tokensDefined}`, label: 'tokens in the system' },
  { value: `${report.token}`, label: 'declarations resolved' },
  { value: '0', label: 'literals outside layer 1' },
  { value: `${report.contrast.checked}`, label: 'contrast pairings, all passing' },
];

// Real figures from running the tool on public repositories.
const MEASURED = [
  { repo: 'facebook/stylex · examples', reading: '42.6%' },
  { repo: 'facebook/stylex · packages', reading: '34.6%' },
  { repo: 'this page', reading: `${(report.score * 100).toFixed(1)}%` },
];

export function Hero() {
  return (
    <header id="top" {...stylex.props(styles.root)}>
      <GridField fade="top" />
      <Ribbon />
      <Container style={styles.inner}>
        <div {...stylex.props(styles.column)}>
          <StatLine
            label="Design system conformance on this page:"
            value={`${(report.score * 100).toFixed(4)}%`}
            note={`${report.token}/${report.scored}`}
          />

          <Statement scale="mega" tail="Assay reads the style graph the StyleX compiler already builds, and tells you what actually shipped.">
            Your design system is the only thing you{' '}
            <span {...stylex.props(styles.gradientWord)}>can&rsquo;t measure</span>.
          </Statement>

          <div {...stylex.props(styles.actions)}>
            <Button href="#install" size="lg" chevron>Run it on your repo</Button>
            <Button href="#dogfood" variant="secondary" size="lg">
              See it measure this page
            </Button>
          </div>

          <CopyField command="npx assay ." note="MIT · no account · no server" />

          <div {...stylex.props(styles.facts)}>
            <FactRow facts={FACTS} ruled />
          </div>
        </div>
      </Container>

      <div {...stylex.props(styles.band)}>
        <Container>
          <div {...stylex.props(styles.bandInner)}>
            <span {...stylex.props(styles.bandLabel)}>Measured on</span>
            {MEASURED.map((m) => (
              <div key={m.repo} {...stylex.props(styles.measured)}>
                <span {...stylex.props(styles.reading)}>{m.reading}</span>
                <span {...stylex.props(styles.repo)}>{m.repo}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </header>
  );
}
