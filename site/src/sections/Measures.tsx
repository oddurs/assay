import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { stroke } from '../tokens/shape.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Terminal } from '../components/Terminal';
import {
  ScoreViz,
  BlastViz,
  ChangeSetViz,
  ContrastViz,
} from '../components/CapabilityViz';

const styles = stylex.create({
  list: { display: 'flex', flexDirection: 'column' },
  // Each capability now carries its own figure, so the section shows four
  // different shapes of answer rather than four paragraphs and one terminal.
  item: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'auto minmax(0, 1.1fr) minmax(0, 1fr)',
      '@media (max-width: 960px)': 'auto minmax(0, 1fr)',
    },
    gap: space.roomy,
    alignItems: 'start',
    paddingBlock: space.roomy,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  viz: {
    gridColumn: { default: 'auto', '@media (max-width: 960px)': '2' },
    alignSelf: 'center',
  },
  terminalWrap: { marginBlockStart: space.bay },
  num: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    color: colors.signal,
    paddingBlockStart: space.tight,
    fontVariantNumeric: 'tabular-nums',
  },
  body: { display: 'flex', flexDirection: 'column', gap: space.tight },
  sticky: { position: 'sticky', insetBlockStart: space.bay },
});

const CAPS = [
  {
    n: '01',
    viz: <ScoreViz />,
    title: 'Conformance score',
    body: 'The share of style declarations resolving to a token rather than a literal — per file, per directory, per team, over time. “System adherence 61% → 87% this quarter” is a sentence you can take into a budget review.',
  },
  {
    n: '02',
    viz: <BlastViz />,
    title: 'Blast radius on every PR',
    body: 'Change one token and the bot tells you it reaches 218 components across 6 teams. Reviewing a token change is blind today, which is exactly why mature systems ossify.',
  },
  {
    n: '03',
    viz: <ChangeSetViz />,
    title: 'Deterministic visual change sets',
    body: 'Diff the compiled graph between two commits for the exact set of components whose styles changed. It narrows the snapshot set rather than replacing visual regression — and on a large monorepo that is an order of magnitude off the CI bill.',
  },
  {
    n: '04',
    viz: <ContrastViz />,
    title: 'Dead tokens and real-pairing contrast',
    body: 'Which of your 340 colour tokens anything actually references. And contrast checked on the foreground/background pairings that occur in the compiled output — not every theoretical combination in the palette.',
  },
];

const OUTPUT = [
  { text: '$ npx stylegraph .', tone: 'prompt' as const },
  { text: '' },
  { text: '  ██████████████░░░░░░░░░░░░░░░░░░░░  42.4%', tone: 'warn' as const },
  { text: '' },
  { text: '     402  token-resolved', tone: 'good' as const },
  { text: '     546  raw literals        ← the violations', tone: 'bad' as const },
  { text: '     948  scored declarations', tone: 'bright' as const },
  { text: '' },
  { text: '  excluded from the score', tone: 'dim' as const },
  {
    text: '       1  dynamic (runtime)   ← unknowable, by design',
    tone: 'dim' as const,
  },
  { text: '     105  keyword / zero / null', tone: 'dim' as const },
  {
    text: '     622  non-token property  ← display, position, …',
    tone: 'dim' as const,
  },
  { text: '' },
  { text: '  by family', tone: 'dim' as const },
  { text: '  color    █████████████░░░░░   73%   212/290' },
  { text: '  type     ██████░░░░░░░░░░░░   31%    87/280' },
  { text: '  space    █████░░░░░░░░░░░░░   28%    57/205' },
  { text: '  motion   ░░░░░░░░░░░░░░░░░░    0%     0/59' },
  { text: '  radius   ███████████░░░░░░░   61%    35/57' },
  { text: '' },
  { text: '  19  tokens never referenced', tone: 'signal' as const },
];

export function Measures() {
  return (
    <Section
      id="measures"
      ruled
      eyebrow="What it measures"
      title="Four questions, one compiler pass."
      tail="stylegraph rides the compile that is already happening, so the whole analysis is a build artifact rather than a separate tool you have to remember to run."
    >
      <div {...stylex.props(styles.list)}>
        {CAPS.map((c) => (
          <div key={c.n} {...stylex.props(styles.item)}>
            <span {...stylex.props(styles.num)}>{c.n}</span>
            <div {...stylex.props(styles.body)}>
              <Text role="title">{c.title}</Text>
              <Text role="body">{c.body}</Text>
            </div>
            <div {...stylex.props(styles.viz)}>{c.viz}</div>
          </div>
        ))}
      </div>
      <div {...stylex.props(styles.terminalWrap)}>
        <Terminal title="StyleX example apps · 85 files" lines={OUTPUT} />
      </div>
    </Section>
  );
}
