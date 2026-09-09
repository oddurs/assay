import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Glass } from '../components/Glass';
import { ThemePicker } from '../components/ThemePicker';
import { ThemeSpecimen } from '../components/ThemeSpecimen';
import { Code } from '../components/Code';
import { THEMES, type ThemeId } from '../themes/themes';

const styles = stylex.create({
  control: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: space.roomy,
    flexWrap: 'wrap',
    marginBlockEnd: space.roomy,
  },
  controlText: { display: 'flex', flexDirection: 'column', gap: space.tight, minWidth: '220px' },
  label: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingLabel,
    textTransform: 'uppercase',
    color: colors.textSubtle,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
      '@media (max-width: 960px)': '1fr',
    },
    gap: space.gutter,
    alignItems: 'start',
  },
  panel: { display: 'flex', flexDirection: 'column', gap: space.gutter },
  // What the selected bundle actually overrides. A theme that only changes
  // colour is a palette; these change the shape of the system too.
  overrides: { display: 'flex', gap: space.tight, flexWrap: 'wrap' },
  group: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    color: colors.accentText,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.accentSubtle,
    borderRadius: radius.sharp,
    paddingBlock: space.hair,
    paddingInline: space.tight,
  },
  blurb: { minHeight: space.roomy },
});

/** The snippet follows the selection — showing `foundry` while Bone is active
 *  would undercut the very claim the section is making. */
const SAMPLE: Record<string, string[]> = {
  midnight: [
    "stylex.createTheme(colors, { accent: palette.violet500, … })",
  ],
  foundry: [
    "stylex.createTheme(colors,    { accent: warm.amber500, … }),",
    "stylex.createTheme(radius,    { round: '3px', loud: '4px' }),",
    "stylex.createTheme(elevation, { mid: '0 2px 0 #0A0908' }),",
  ],
  verdigris: [
    "stylex.createTheme(colors,    { accent: sea.patina500, … }),",
    "stylex.createTheme(radius,    { round: '11px', loud: '18px' }),",
    "stylex.createTheme(elevation, { glow: '0 0 56px -14px …' }),",
  ],
  bone: [
    "stylex.createTheme(colors,    { bgBase: bone.p050, … }),",
    "stylex.createTheme(radius,    { round: '4px', loud: '6px' }),",
    "stylex.createTheme(elevation, { low: 'none', glow: 'none' }),",
    "stylex.createTheme(stroke,    { bold: '3px' }),",
  ],
};

function snippetFor(id: string, name: string) {
  const lines = SAMPLE[id] ?? SAMPLE.midnight;
  const isBundle = lines.length > 1;
  return [
    '// A theme is a BUNDLE, not a palette. createTheme works',
    '// on any defineVars group, so a theme changes the shape',
    '// of the system — not only its colour.',
    '',
    `export const ${id} = ${isBundle ? '[' : ''}`,
    ...lines.map((l) => '  ' + l),
    isBundle ? '];' : ';',
    '',
    '// Applied once, at the root. No component is aware.',
    `<div className={${id}}>  // ${name}`,
  ].join('\n');
}

export function Themes({
  theme,
  onTheme,
}: {
  theme: ThemeId;
  onTheme: (id: ThemeId) => void;
}) {
  const active = THEMES.find((th) => th.id === theme) ?? THEMES[0];

  return (
    <Section
      id="themes"
      ruled
      eyebrow="Why StyleX"
      title="A theme is not a palette."
      tail="It is the whole system’s personality, and one object carries it."
      aside={
        <Text role="body">
          <code>createTheme</code> overrides any token group, so these four change
          colour, corner radius and elevation together. Foundry has square corners
          and hard shadows because it is industrial; Bone barely casts one, because
          paper does not float.
        </Text>
      }
    >
      <div {...stylex.props(styles.control)}>
        <div {...stylex.props(styles.controlText)}>
          <span {...stylex.props(styles.label)}>Theme · {active.name}</span>
          <div {...stylex.props(styles.blurb)}>
            <Text role="caption">{active.blurb}</Text>
          </div>
        </div>
        <ThemePicker value={theme} onChange={onTheme} />
      </div>

      <div {...stylex.props(styles.layout)}>
        <Glass strong>
          <div {...stylex.props(styles.panel)}>
            <div {...stylex.props(styles.overrides)}>
              {active.overrides.map((g) => (
                <span key={g} {...stylex.props(styles.group)}>
                  createTheme({g})
                </span>
              ))}
            </div>
            <ThemeSpecimen />
          </div>
        </Glass>

        <Code filename="src/themes/themes.ts">{snippetFor(active.id, active.name)}</Code>
      </div>
    </Section>
  );
}
