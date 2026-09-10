import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { stroke } from '../tokens/shape.stylex';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import report from '../generated/report.json';

const styles = stylex.create({
  root: {
    borderTopWidth: stroke.hair,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    paddingBlock: space.bay,
    backgroundColor: colors.bgSunken,
  },
  row: { display: 'flex', gap: space.gutter, flexWrap: 'wrap', alignItems: 'center' },
  stamp: {
    marginInlineStart: 'auto',
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.textSubtle,
    fontVariantNumeric: 'tabular-nums',
  },
});

export function SiteFooter() {
  return (
    <footer {...stylex.props(styles.root)}>
      <Container>
        <div {...stylex.props(styles.row)}>
          <Text role="caption">
            Built with StyleX · measured by stylegraph on every build · MIT
          </Text>
          <span {...stylex.props(styles.stamp)}>
            {(report.score * 100).toFixed(1)}% · {report.token}/{report.scored}
          </span>
        </div>
      </Container>
    </footer>
  );
}
