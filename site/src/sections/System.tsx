import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Code } from '../components/Code';
import { Badge } from '../components/Badge';

const styles = stylex.create({
  layout: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 0.85fr) minmax(0, 1.15fr)',
      '@media (max-width: 960px)': '1fr',
    },
    gap: space.bay,
    alignItems: 'start',
  },
  ladder: { display: 'flex', flexDirection: 'column' },
  rung: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: space.gutter,
    paddingBlock: space.gutter,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    cursor: 'pointer',
    backgroundColor: { default: 'transparent', ':hover': colors.bgSurface },
  },
  rungActive: { backgroundColor: colors.bgSurface },
  chip: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    fontWeight: t.weightSemibold,
    letterSpacing: t.trackingWide,
    color: colors.textOnAccent,
    backgroundColor: colors.accent,
    borderRadius: radius.sharp,
    paddingBlock: space.hair,
    paddingInline: space.tight,
    alignSelf: 'flex-start',
    lineHeight: t.leadingNormal,
  },
  chipMuted: { backgroundColor: colors.bgOverlay, color: colors.textMuted },
  rungBody: { display: 'flex', flexDirection: 'column', gap: space.tight },
  rule: {
    marginBlockStart: space.gutter,
    padding: space.gutter,
    borderRadius: radius.round,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.signal,
    backgroundColor: colors.bgSunken,
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
  },
  codeStack: { display: 'flex', flexDirection: 'column', gap: space.gutter },
});

const PRIMITIVES = `// LAYER 1 — the only file where a literal is legal
export const palette = stylex.defineConsts({
  ink000: '#04060A',
  violet500: '#7C5CFF',
  rose500: '#F5468C',
});
// defineConsts is inlined at build time: zero runtime cost,
// and deliberately not themeable.`;

const SEMANTIC = `// LAYER 2 — names a ROLE, never a hue
export const colors = stylex.defineVars({
  bgSurface: palette.ink100,
  textPrimary: palette.ink900,
  accent: palette.violet500,
  signal: palette.rose500,
});`;

const THEME = `// LAYER 3 — one object re-skins the entire site
export const daylight = stylex.createTheme(colors, {
  bgSurface: palette.ink950,
  textPrimary: palette.ink100,
  accent: palette.violet600,
});`;

const COMPONENT = `// LAYER 4 — tokens only. No component knows a theme exists.
const styles = stylex.create({
  card: {
    backgroundColor: colors.bgSurface,
    color: colors.textPrimary,
    padding: space.roomy,
    borderRadius: radius.loud,
    boxShadow: elevation.mid,
  },
});`;

const RUNGS = [
  { id: 'L1', name: 'Primitives', desc: 'Raw scales as compile-time constants. Ink ramp, spacing scale, type scale, easing curves. Inlined, not themeable, and the only legal home for a literal.', accent: true },
  { id: 'L2', name: 'Semantic tokens', desc: 'defineVars naming roles: bgSurface, textMuted, accent, signal, pass. Nothing downstream ever learns a hue name, which is the whole reason layer 3 works.', accent: true },
  { id: 'L3', name: 'Themes', desc: 'createTheme overrides of layer 2. A complete light mode is one object, because layer 2 never committed to a colour.', accent: true },
  { id: 'L4', name: 'Components & sections', desc: 'Every style in the site. Reads from layer 2 exclusively. Assay fails the build if a single literal appears here.', accent: false },
];

export function System() {
  return (
    <Section
      id="system"
      ruled
      grid="centre"
      eyebrow="Design system"
      title="Four layers, strictly one-directional."
      tail="The structure is the argument."
      aside={
        <Text role="body">
          Each layer may only reference the one above it — a rule you can state in a
          sentence and, unusually, actually enforce, because the compiler makes the
          violations countable.
        </Text>
      }
    >
      <div {...stylex.props(styles.layout)}>
        <div>
          <div {...stylex.props(styles.ladder)}>
            {RUNGS.map((r) => (
              <div key={r.id} {...stylex.props(styles.rung)}>
                <span {...stylex.props(styles.chip, !r.accent && styles.chipMuted)}>{r.id}</span>
                <div {...stylex.props(styles.rungBody)}>
                  <Text role="title">{r.name}</Text>
                  <Text role="body">{r.desc}</Text>
                </div>
              </div>
            ))}
          </div>
          <div {...stylex.props(styles.rule)}>
            <Badge tone="signal">The enforced rule</Badge>
            <Text role="body">
              <strong>A literal outside layer 1 fails the build.</strong> Not a lint warning
              somebody mutes — <code>npm run check</code> runs Assay with a 100% gate, and CI
              refuses the merge. That is the difference between a design system and a
              suggestion.
            </Text>
          </div>
        </div>

        <div {...stylex.props(styles.codeStack)}>
          <Code filename="src/tokens/primitives.stylex.ts">{PRIMITIVES}</Code>
          <Code filename="src/tokens/color.stylex.ts">{SEMANTIC}</Code>
          <Code filename="src/themes/themes.ts">{THEME}</Code>
          <Code filename="src/components/Card.tsx">{COMPONENT}</Code>
        </div>
      </div>
    </Section>
  );
}
