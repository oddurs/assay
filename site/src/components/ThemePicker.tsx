import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';
import { THEMES, type ThemeId } from '../themes/themes';

const styles = stylex.create({
  row: { display: 'flex', gap: space.tight, flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.snug,
    paddingBlock: space.tight,
    paddingInline: space.snug,
    borderRadius: radius.pill,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: { default: colors.border, ':hover': colors.borderStrong },
    backgroundColor: { default: colors.bgRaised, ':hover': colors.bgHover },
    color: { default: colors.textMuted, ':hover': colors.textPrimary },
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    fontWeight: t.weightMedium,
    lineHeight: t.leadingSnug,
    cursor: 'pointer',
    transitionProperty: 'color, background-color, border-color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
  active: {
    borderColor: colors.accent,
    color: colors.textPrimary,
    backgroundColor: colors.bgOverlay,
  },
  swatch: (bg: string) => ({
    width: space.snug,
    height: space.snug,
    borderRadius: radius.pill,
    backgroundColor: bg,
    flexShrink: 0,
  }),
});

export function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
}) {
  return (
    <div {...stylex.props(styles.row)} role="group" aria-label="Theme">
      {THEMES.map((th) => (
        <button
          key={th.id}
          type="button"
          aria-pressed={value === th.id}
          onClick={() => onChange(th.id)}
          {...stylex.props(styles.chip, value === th.id && styles.active)}
        >
          <span {...stylex.props(styles.swatch(th.swatch))} />
          {th.name}
        </button>
      ))}
    </div>
  );
}
