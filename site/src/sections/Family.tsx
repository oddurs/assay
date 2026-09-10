import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { motion } from '../tokens/motion.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Glass } from '../components/Glass';
import packages from '../generated/packages.json';

/**
 * The family index. Which packages are written is read from the packages
 * themselves, so this list cannot claim something exists that does not.
 */
const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@media (max-width: 960px)': 'repeat(2, minmax(0, 1fr))',
      '@media (max-width: 640px)': '1fr',
    },
    gap: space.gutter,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    height: '100%',
    textDecoration: 'none',
    color: 'inherit',
  },
  head: { display: 'flex', alignItems: 'baseline', gap: space.snug },
  name: {
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    color: colors.textPrimary,
  },
  status: {
    marginInlineStart: 'auto',
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    letterSpacing: t.trackingWide,
    textTransform: 'uppercase',
    borderRadius: radius.pill,
    paddingBlock: space.hair,
    paddingInline: space.snug,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
  },
  written: { color: colors.pass, borderColor: colors.pass },
  scaffold: { color: colors.textSubtle, borderColor: colors.border },
  link: {
    marginBlockStart: 'auto',
    paddingBlockStart: space.snug,
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: { default: colors.accentText, ':hover': colors.textPrimary },
    transitionProperty: 'color',
    transitionDuration: motion.quick,
    transitionTimingFunction: motion.easeStandard,
  },
});

export function Family() {
  return (
    <Section
      id="family"
      ruled
      grid="side"
      eyebrow="The family"
      title="One format, and the tools that read it."
      tail="Six packages, and the specification none of them owns."
      aside={
        <Text role="body">
          Which of these are written is read from the packages at build time. A page
          that claims a package exists while its entry point is a placeholder is the
          drift this project is about.
        </Text>
      }
    >
      <div {...stylex.props(styles.grid)}>
        {packages.map((p) => (
          <Glass key={p.name} interactive>
            <a href={`${p.name}/`} {...stylex.props(styles.card)}>
              <div {...stylex.props(styles.head)}>
                <span {...stylex.props(styles.name)}>{p.pkg}</span>
                <span
                  {...stylex.props(
                    styles.status,
                    p.written ? styles.written : styles.scaffold,
                  )}
                >
                  {p.written ? 'written' : 'planned'}
                </span>
              </div>
              <Text role="body">{p.description}</Text>
              <span {...stylex.props(styles.link)}>
                {p.written ? 'read more →' : 'see the plan →'}
              </span>
            </a>
          </Glass>
        ))}
      </div>
    </Section>
  );
}
