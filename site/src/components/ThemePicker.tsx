import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';
import { THEMES, type ThemeId } from '../themes/themes';

/**
 * The picker shows each theme as a strip of its own colours rather than a
 * single dot, because a theme is a palette and a dot cannot say which one.
 */
const styles = stylex.create({
  row: { display: 'flex', gap: space.snug, flexWrap: 'wrap', alignItems: 'stretch' },
  chip: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    minWidth: '132px',
    textAlign: 'start',
    paddingBlock: space.snug,
    paddingInline: space.snug,
    borderRadius: radius.soft,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: { default: colors.border, ':hover': colors.borderStrong },
    backgroundColor: { default: 'transparent', ':hover': colors.bgHover },
    cursor: 'pointer',
    transitionProperty: 'border-color, background-color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
  active: { borderColor: colors.accent, backgroundColor: colors.bgOverlay },
  strip: { display: 'flex', height: space.gutter, borderRadius: radius.sharp, overflow: 'hidden' },
  band: (bg: string) => ({ flex: '1', backgroundColor: bg }),
  name: {
    fontFamily: t.familyBody,
    fontSize: t.captionSize,
    fontWeight: t.weightMedium,
    color: colors.textMuted,
    lineHeight: t.leadingSnug,
  },
  nameActive: { color: colors.textPrimary },
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
          <span {...stylex.props(styles.strip)} aria-hidden>
            {th.swatches.map((c, i) => (
              <span key={i} {...stylex.props(styles.band(c))} />
            ))}
          </span>
          <span {...stylex.props(styles.name, value === th.id && styles.nameActive)}>
            {th.name}
          </span>
        </button>
      ))}
    </div>
  );
}
