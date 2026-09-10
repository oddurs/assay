import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Badge } from '../components/Badge';

const styles = stylex.create({
  rail: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(5, minmax(0, 1fr))',
      '@media (max-width: 960px)': '1fr',
    },
    gap: space.gutter,
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    paddingBlockStart: space.gutter,
    borderTopWidth: stroke.bold,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  done: { borderTopColor: colors.pass },
  now: { borderTopColor: colors.accent },
  when: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    color: colors.textSubtle,
    textTransform: 'uppercase',
  },
  state: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.tight,
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    textTransform: 'uppercase',
  },
  stateDone: { color: colors.pass },
  stateNow: { color: colors.accentText },
  stateNext: { color: colors.textSubtle },
  pip: {
    width: space.snug,
    height: space.snug,
    borderRadius: radius.pill,
    backgroundColor: 'currentColor',
  },
  gate: {
    marginBlockStart: space.bay,
    display: 'flex',
    gap: space.gutter,
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingBlock: space.gutter,
    paddingInline: space.roomy,
    borderInlineStartWidth: stroke.bold,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colors.signal,
    backgroundColor: colors.bgSurface,
  },
  gateBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.tight,
    maxWidth: '620px',
  },
});

type StepState = 'done' | 'now' | 'next';

const STEPS: { when: string; name: string; body: string; state: StepState }[] = [
  {
    when: 'Oct',
    name: 'v0.1 The format',
    body: 'The graph is specified and one tool reads it well enough to run a real design system.',
    state: 'now',
  },
  {
    when: 'Dec',
    name: 'v0.2 Tokens',
    body: 'DTCG both directions. StyleX stops being outside the industry token pipeline.',
    state: 'next',
  },
  {
    when: 'Feb',
    name: 'v0.3 Authoring',
    body: 'Variants to write with, and tests that assert on tokens rather than class names.',
    state: 'next',
  },
  {
    when: 'Apr',
    name: 'v1.0 Stable',
    body: 'The format frozen at v1, every package documented, safe to depend on.',
    state: 'next',
  },
  {
    when: 'later',
    name: 'An agent surface',
    body: 'MCP over the graph, so an agent can check a change before it writes it.',
    state: 'next',
  },
];

export function Roadmap() {
  return (
    <Section
      id="roadmap"
      ruled
      eyebrow="Roadmap"
      title="Every milestone ships alone. Every gate can be lost."
      tail="The dates are commitments about sequence, not calendar."
      aside={
        <Text role="body">
          What must not slip is the order — the launch happens before the CI work, so
          the first gate can kill the project before anyone builds infrastructure for
          nobody.
        </Text>
      }
    >
      <div {...stylex.props(styles.rail)}>
        {STEPS.map((s) => (
          <div
            key={s.name}
            {...stylex.props(
              styles.step,
              s.state === 'done' && styles.done,
              s.state === 'now' && styles.now,
            )}
          >
            <span
              {...stylex.props(
                styles.state,
                s.state === 'done'
                  ? styles.stateDone
                  : s.state === 'now'
                    ? styles.stateNow
                    : styles.stateNext,
              )}
            >
              <span {...stylex.props(styles.pip)} aria-hidden />
              {s.state === 'done'
                ? 'shipped'
                : s.state === 'now'
                  ? 'in progress'
                  : 'planned'}
            </span>
            <span {...stylex.props(styles.when)}>{s.when}</span>
            <Text role="title">{s.name}</Text>
            <Text role="caption">{s.body}</Text>
          </div>
        ))}
      </div>

      <div {...stylex.props(styles.gate)}>
        <Badge tone="signal">The bet</Badge>
        <div {...stylex.props(styles.gateBody)}>
          <Text role="title">Why the format comes first</Text>
          <Text role="body">
            Thirty days after the launch post, the question is not whether people liked
            it — it is whether anyone ran it on their own codebase unasked. Three teams
            and it continues. Silence and it stops, with six weeks spent and a real tool
            shipped.
          </Text>
        </div>
      </div>
    </Section>
  );
}
