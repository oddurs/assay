import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { stroke } from '../tokens/shape.stylex';
import { layer } from '../tokens/motion.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Terminal } from '../components/Terminal';
import { Button } from '../components/Button';
import { Glow } from '../components/Glow';

const styles = stylex.create({
  root: { position: 'relative', overflow: 'hidden' },
  inner: { position: 'relative', zIndex: layer.raised },
  layout: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr) minmax(0, 1.1fr)',
      '@media (max-width: 960px)': '1fr',
    },
    gap: space.bay,
    alignItems: 'center',
  },
  copy: { display: 'flex', flexDirection: 'column', gap: space.gutter, alignItems: 'flex-start' },
  actions: { display: 'flex', gap: space.snug, flexWrap: 'wrap' },
  caveats: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    marginBlockStart: space.gutter,
    paddingBlockStart: space.gutter,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    width: '100%',
  },
});

const LINES = [
  { text: '$ npx assay .', tone: 'prompt' as const },
  { text: '' },
  { text: '  ████████████████████████████████░░  94.2%', tone: 'good' as const },
  { text: '' },
  { text: '     1,284  token-resolved', tone: 'good' as const },
  { text: '        79  raw literals', tone: 'bad' as const },
  { text: '' },
  { text: '  most literals', tone: 'dim' as const },
  { text: '      31  src/features/billing/Invoice.tsx' },
  { text: '      18  src/features/onboarding/Step.tsx' },
  { text: '' },
  { text: '$ npx assay diff main HEAD', tone: 'prompt' as const },
  { text: '  space.md changed → 218 components, 6 teams', tone: 'signal' as const },
  { text: '  3 of them outside your org', tone: 'warn' as const },
];

export function Install() {
  return (
    <div {...stylex.props(styles.root)}>
      <Glow grid={false} />
      <div {...stylex.props(styles.inner)}>
        <Section id="install" ruled eyebrow="Get started">
          <div {...stylex.props(styles.layout)}>
            <div {...stylex.props(styles.copy)}>
              <Text role="display">No account. No server. One number.</Text>
              <Text role="lead">
                Point it at a repo that uses StyleX. It rides the compile that is already
                happening, caches per file by content hash, and stays under three percent of
                build time — or it is a command people forget to run.
              </Text>
              <div {...stylex.props(styles.actions)}>
                <Button size="lg">Read the docs</Button>
                <Button variant="secondary" size="lg">GitHub</Button>
              </div>
              <div {...stylex.props(styles.caveats)}>
                <Text role="caption">
                  Requires StyleX 0.15+. Works with the Babel plugin, the unplugin, and the CLI.
                  Reads your source; sends nothing anywhere.
                </Text>
              </div>
            </div>
            <Terminal title="assay · a real monorepo" lines={LINES} />
          </div>
        </Section>
      </div>
    </div>
  );
}
