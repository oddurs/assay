import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Meter } from '../components/Meter';
import { ThemePicker } from '../components/ThemePicker';
import { Code } from '../components/Code';
import type { ThemeId } from '../themes/themes';

const styles = stylex.create({
  layout: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr) minmax(0, 1fr)',
      '@media (max-width: 960px)': '1fr',
    },
    gap: space.gutter,
    alignItems: 'start',
  },
  stage: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.gutter,
    padding: space.roomy,
    borderRadius: radius.loud,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.bgSurface,
  },
  row: { display: 'flex', gap: space.snug, flexWrap: 'wrap', alignItems: 'center' },
  swatches: { display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: space.tight },
  swatch: {
    height: space.loose,
    borderRadius: radius.soft,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  sBase: { backgroundColor: colors.bgBase },
  sSurface: { backgroundColor: colors.bgOverlay },
  sAccent: { backgroundColor: colors.accent },
  sSignal: { backgroundColor: colors.signal },
  sPass: { backgroundColor: colors.pass },
  sWarn: { backgroundColor: colors.warn },
  band: {
    height: space.section,
    borderRadius: radius.round,
    backgroundImage: `linear-gradient(96deg, ${colors.gradientFrom}, ${colors.gradientVia} 50%, ${colors.gradientTo})`,
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    paddingBlockStart: space.gutter,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  label: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingLabel,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
});

const SNIPPET = `export const daylight = stylex.createTheme(colors, {
  bgBase:      palette.ink950,
  bgSurface:   palette.ink950,
  textPrimary: palette.ink100,
  accent:      palette.violet600,
  signal:      palette.rose600,
});

// Applied once, at the root:
<div {...stylex.props(daylight)}>`;

export function Themes({
  theme,
  onTheme,
}: {
  theme: ThemeId;
  onTheme: (id: ThemeId) => void;
}) {
  return (
    <Section
      id="themes"
      ruled
      eyebrow="Why StyleX"
      title="One object re-skins everything. Including this page."
      intro="This is the capability no other styling system can match cleanly, and it is the reason a conformance score is even definable. Because layer 2 names roles instead of hues, a theme is a data change — not a find-and-replace across class strings."
    >
      <div {...stylex.props(styles.layout)}>
        <div {...stylex.props(styles.stage)}>
          <div {...stylex.props(styles.row)}>
            <Badge tone="accent">Live</Badge>
            <Text role="caption">every token below is a role, not a colour</Text>
          </div>

          <div {...stylex.props(styles.band)} />

          <div {...stylex.props(styles.swatches)}>
            <div {...stylex.props(styles.swatch, styles.sBase)} />
            <div {...stylex.props(styles.swatch, styles.sSurface)} />
            <div {...stylex.props(styles.swatch, styles.sAccent)} />
            <div {...stylex.props(styles.swatch, styles.sSignal)} />
            <div {...stylex.props(styles.swatch, styles.sPass)} />
            <div {...stylex.props(styles.swatch, styles.sWarn)} />
          </div>

          <Meter value={0.874} label="sample component" denom="87/100" />

          <div {...stylex.props(styles.row)}>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          <div {...stylex.props(styles.controls)}>
            <span {...stylex.props(styles.label)}>Theme</span>
            <ThemePicker value={theme} onChange={onTheme} />
          </div>
        </div>

        <Code filename="src/themes/themes.ts">{SNIPPET}</Code>
      </div>
    </Section>
  );
}
