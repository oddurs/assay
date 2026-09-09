import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { stroke } from '../tokens/shape.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
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
  stat: {
    display: 'flex',
    gap: space.roomy,
    flexWrap: 'wrap',
    marginBlockEnd: space.bay,
  },
  statItem: { display: 'flex', flexDirection: 'column', gap: space.tight, maxWidth: '260px' },
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
    title: 'Assay',
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
        <div {...stylex.props(styles.statItem)}>
          <Text role="heading">44%</Text>
          <Text role="caption">
            of teams describe their design system as unstable or very unstable
          </Text>
        </div>
        <div {...stylex.props(styles.statItem)}>
          <Text role="heading">8%</Text>
          <Text role="caption">say it is very stable</Text>
        </div>
        <div {...stylex.props(styles.statItem)}>
          <Text role="heading">40%</Text>
          <Text role="caption">
            have an automated token pipeline — zeroheight Design Systems Report 2026
          </Text>
        </div>
      </div>

      <div {...stylex.props(styles.grid)}>
        {LAYERS.map((l) => (
          <Card key={l.title} style={l.tone === 'accent' ? styles.ours : null}>
            <div {...stylex.props(styles.card)}>
              <Badge tone={l.tone === 'accent' ? 'accent' : 'neutral'}>{l.verdict}</Badge>
              <Text role="title">{l.title}</Text>
              <Text role="caption">{l.who}</Text>
              <div {...stylex.props(styles.reads)}>
                <Text role="body">{l.body}</Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
