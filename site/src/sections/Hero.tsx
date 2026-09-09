import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { layer } from '../tokens/motion.stylex';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Glow } from '../components/Glow';
import report from '../generated/report.json';

const styles = stylex.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    paddingBlock: space.act,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  inner: { position: 'relative', zIndex: layer.raised, maxWidth: '860px' },
  stack: { display: 'flex', flexDirection: 'column', gap: space.roomy, alignItems: 'flex-start' },
  gradientWord: {
    backgroundImage: `linear-gradient(96deg, ${colors.gradientFrom}, ${colors.gradientVia} 46%, ${colors.gradientTo})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  lead: { maxWidth: '620px' },
  actions: { display: 'flex', gap: space.snug, flexWrap: 'wrap', alignItems: 'center' },
  install: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.snug,
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    color: colors.textSecondary,
    backgroundColor: colors.bgSurface,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingBlock: space.snug,
    paddingInline: space.gutter,
  },
  prompt: { color: colors.accentText },
  facts: {
    display: 'flex',
    gap: space.roomy,
    flexWrap: 'wrap',
    marginBlockStart: space.gutter,
    paddingBlockStart: space.gutter,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    width: '100%',
  },
  fact: { display: 'flex', flexDirection: 'column', gap: space.hair },
  factValue: {
    fontFamily: t.familyBody,
    fontSize: t.titleSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingSnug,
    color: colors.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  },
});

const FACTS = [
  { value: `${(report.score * 100).toFixed(0)}%`, label: 'this site’s own score' },
  { value: `${report.tokensDefined}`, label: 'tokens in the system' },
  { value: '0', label: 'literals outside layer 1' },
  { value: 'MIT', label: 'licence, forever' },
];

export function Hero() {
  return (
    <header id="top" {...stylex.props(styles.root)}>
      <Glow />
      <Container>
        <div {...stylex.props(styles.inner)}>
          <div {...stylex.props(styles.stack)}>
            <Badge tone="signal">Compile-time conformance for StyleX</Badge>
            <Text role="mega">
              Your design system is the only thing you{' '}
              <span {...stylex.props(styles.gradientWord)}>can&rsquo;t measure</span>.
            </Text>
            <Text role="lead" style={styles.lead}>
              Assay reads the style graph the StyleX compiler already builds and tells you
              what actually shipped — how much of your UI is really the system, what a token
              change will break, and which components changed visually. Free, MIT, runs in CI.
            </Text>
            <div {...stylex.props(styles.actions)}>
              <Button href="#install" size="lg">Run it on your repo</Button>
              <Button href="#dogfood" variant="secondary" size="lg">See it measure this page</Button>
            </div>
            <div {...stylex.props(styles.install)}>
              <span {...stylex.props(styles.prompt)}>$</span>
              npx assay .
            </div>
            <div {...stylex.props(styles.facts)}>
              {FACTS.map((f) => (
                <div key={f.label} {...stylex.props(styles.fact)}>
                  <span {...stylex.props(styles.factValue)}>{f.value}</span>
                  <Text role="caption">{f.label}</Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
