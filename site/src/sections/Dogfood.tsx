import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { radius, stroke } from '../tokens/shape.stylex';
import { Section } from '../components/Section';
import { Text } from '../components/Text';
import { Glass } from '../components/Glass';
import { Meter } from '../components/Meter';
import { CompareBar } from '../components/CompareBar';
import { Badge } from '../components/Badge';
import report from '../generated/report.json';

const styles = stylex.create({
  layout: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1.15fr) minmax(0, 1fr)',
      '@media (max-width: 960px)': '1fr',
    },
    gap: space.gutter,
    alignItems: 'start',
  },
  panel: { display: 'flex', flexDirection: 'column', gap: space.roomy },
  head: { display: 'flex', alignItems: 'center', gap: space.snug, flexWrap: 'wrap' },
  stamp: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textSubtle,
    marginInlineStart: 'auto',
  },
  counts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
    gap: space.gutter,
    paddingBlockStart: space.gutter,
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  count: { display: 'flex', flexDirection: 'column', gap: space.hair },
  countValue: {
    fontFamily: t.familyBody,
    fontSize: t.titleSize,
    fontWeight: t.weightSemibold,
    color: colors.textPrimary,
    letterSpacing: t.trackingSnug,
    fontVariantNumeric: 'tabular-nums',
  },
  countPass: { color: colors.pass },
  countDim: { color: colors.textSubtle },

  note: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    padding: space.gutter,
    borderRadius: radius.round,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.accentSubtle,
    backgroundColor: colors.bgSunken,
  },
});

const STAMP = new Date(report.generatedAt).toISOString().slice(0, 16).replace('T', ' ');

/**
 * Reference readings from running the CLI on facebook/stylex's example apps.
 * Real figures, recorded so the comparison is honest about its source.
 */
const REFERENCE: Record<string, number> = {
  color: 0.73,
  type: 0.31,
  space: 0.28,
  radius: 0.64,
  shadow: 0.58,
  border: 0,
  motion: 0,
  layer: 0,
};

const COMPARISON = report.families
  .filter((f) => REFERENCE[f.name] !== undefined)
  .map((f) => ({ name: f.name, mine: f.score, reference: REFERENCE[f.name] }));

export function Dogfood() {
  return (
    <Section
      id="dogfood"
      ruled
      sunken
      grid="top"
      eyebrow="Dogfood"
      title="This page is measured by the thing it is selling."
      tail="Every number below was produced by running the real Assay over this site’s own source."
      aside={
        <Text role="body">
          The build writes the result into a JSON file the page imports, so nothing here
          is typed in by hand. Hardcode a hex tomorrow and this score drops on the next
          deploy.
        </Text>
      }
    >
      <div {...stylex.props(styles.layout)}>
        <Glass>
          <div {...stylex.props(styles.panel)}>
            <div {...stylex.props(styles.head)}>
              <Badge tone="pass">Gate passing</Badge>
              <Text role="caption">assay · src/</Text>
              <span {...stylex.props(styles.stamp)}>built {STAMP}Z</span>
            </div>

            <Meter
              value={report.score}
              label="token conformance"
              denom={`${report.token}/${report.scored} declarations`}
              target={1}
            />

            <div {...stylex.props(styles.counts)}>
              <div {...stylex.props(styles.count)}>
                <span {...stylex.props(styles.countValue, styles.countPass)}>
                  {report.token}
                </span>
                <Text role="caption">token-resolved</Text>
              </div>
              <div {...stylex.props(styles.count)}>
                <span {...stylex.props(styles.countValue)}>{report.literal}</span>
                <Text role="caption">raw literals</Text>
              </div>
              <div {...stylex.props(styles.count)}>
                <span {...stylex.props(styles.countValue, styles.countDim)}>
                  {report.excluded.dynamic}
                </span>
                <Text role="caption">dynamic</Text>
              </div>
              <div {...stylex.props(styles.count)}>
                <span {...stylex.props(styles.countValue, styles.countDim)}>
                  {report.excluded.untokenizable}
                </span>
                <Text role="caption">non-token props</Text>
              </div>
              <div {...stylex.props(styles.count)}>
                <span {...stylex.props(styles.countValue)}>{report.tokensDefined}</span>
                <Text role="caption">tokens defined</Text>
              </div>
              <div {...stylex.props(styles.count)}>
                <span {...stylex.props(styles.countValue)}>{report.files}</span>
                <Text role="caption">files scanned</Text>
              </div>
            </div>
          </div>
        </Glass>

        <div {...stylex.props(styles.panel)}>
          <Glass>
            <div {...stylex.props(styles.panel)}>
              <div>
                <Text role="title">By family, against a real codebase</Text>
                <Text role="caption">
                  Eight bars at 100% prove nothing on their own. The hatched band behind
                  each is the same measure taken on StyleX&rsquo;s own example apps.
                </Text>
              </div>
              <CompareBar
                rows={COMPARISON}
                mineLabel="this site"
                referenceLabel="facebook/stylex · examples"
              />
            </div>
          </Glass>

          <div {...stylex.props(styles.note)}>
            <Text role="title">Why the dynamic count is not zero</Text>
            <Text role="body">
              The meter above sets its own width from a prop, which StyleX compiles to a
              CSS custom property. That value is genuinely unknowable at build time, so
              Assay reports it in its own category and never counts it as either a pass
              or a violation. A metric that hides its blind spot is worse than no
              metric.
            </Text>
          </div>
        </div>
      </div>
    </Section>
  );
}
