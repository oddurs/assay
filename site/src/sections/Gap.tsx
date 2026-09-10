import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { stroke } from '../tokens/shape.stylex';
import { type as t } from '../tokens/type.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Glass } from '../components/Glass';
import { Badge } from '../components/Badge';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@media (max-width: 860px)': '1fr',
    },
    gap: space.gutter,
  },
  card: { display: 'flex', flexDirection: 'column', gap: space.snug },
  ours: { borderColor: colors.accentSubtle },
  reads: {
    marginBlockStart: space.snug,
    paddingBlockStart: space.snug,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  // The report figures are the strongest evidence on the page. They were set
  // at caption size in a flat row; now they are the size of the claim they make.
  stat: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@media (max-width: 720px)': '1fr',
    },
    gap: space.gutter,
    marginBlockEnd: space.gutter,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    paddingBlock: space.gutter,
    paddingInlineStart: space.gutter,
    borderInlineStartWidth: stroke.bold,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colors.gridLineStrong,
  },
  statLead: { borderInlineStartColor: colors.signal },
  statValue: {
    fontFamily: t.familyBody,
    fontSize: { default: t.heroSize, '@media (max-width: 720px)': t.displaySize },
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingTight,
    lineHeight: t.leadingTight,
    color: colors.textPrimary,
    fontVariantNumeric: 'tabular-nums',
  },
  source: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textSubtle,
    marginBlockEnd: space.bay,
  },
});

const LAYERS = [
  {
    tone: 'neutral' as const,
    verdict: 'Upstream of the code',
    title: 'Spec tools',
    who: 'zeroheight, Supernova, Knapsack',
    body: 'They document what the system says. Nothing they hold is derived from what the compiler emitted, so drift is invisible to them by construction.',
  },
  {
    tone: 'neutral' as const,
    verdict: 'Components, not styles',
    title: 'Usage analytics',
    who: 'Omlet',
    body: 'Reads the AST for which components get imported where. Tells you a Card was used 400 times. Cannot tell you that 90 of those set a hardcoded padding.',
  },
  {
    tone: 'accent' as const,
    verdict: 'The compiled style graph',
    title: 'stylegraph',
    who: 'this',
    body: 'Every declaration, with provenance: did this value come from a token, a literal, or a runtime expression. The gap between the spec and the pixels, closed.',
  },
];

export function Gap() {
  return (
    <Section
      id="gap"
      ruled
      grid="side"
      eyebrow="The gap"
      title="Nobody can tell you what styles actually shipped."
      tail="Not because it doesn’t matter — because until StyleX, it wasn’t computable."
      aside={
        <Text role="body">
          Tailwind assembles strings at runtime. styled-components interpolates props
          into template literals. CSS Modules hands you opaque class references. You
          cannot statically answer “did this padding come from a token” in any of them.
        </Text>
      }
    >
      <div {...stylex.props(styles.stat)}>
        <div {...stylex.props(styles.statItem, styles.statLead)}>
          <span {...stylex.props(styles.statValue)}>44%</span>
          <Text role="body">
            of teams describe their design system as unstable or very unstable
          </Text>
        </div>
        <div {...stylex.props(styles.statItem)}>
          <span {...stylex.props(styles.statValue)}>8%</span>
          <Text role="body">say it is very stable</Text>
        </div>
        <div {...stylex.props(styles.statItem)}>
          <span {...stylex.props(styles.statValue)}>40%</span>
          <Text role="body">have an automated token pipeline</Text>
        </div>
      </div>
      <p {...stylex.props(styles.source)}>zeroheight · Design Systems Report 2026</p>

      <div {...stylex.props(styles.grid)}>
        {LAYERS.map((l) => (
          <Glass
            key={l.title}
            strong={l.tone === 'accent'}
            style={l.tone === 'accent' ? styles.ours : null}
          >
            <div {...stylex.props(styles.card)}>
              <Badge tone={l.tone === 'accent' ? 'accent' : 'neutral'}>
                {l.verdict}
              </Badge>
              <Text role="title">{l.title}</Text>
              <Text role="caption">{l.who}</Text>
              <div {...stylex.props(styles.reads)}>
                <Text role="body">{l.body}</Text>
              </div>
            </div>
          </Glass>
        ))}
      </div>
    </Section>
  );
}
