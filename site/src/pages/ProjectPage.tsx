import * as stylex from '@stylexjs/stylex';
import { colors } from '../tokens/color.stylex';
import { space } from '../tokens/space.stylex';
import { type as t } from '../tokens/type.stylex';
import { stroke, radius } from '../tokens/shape.stylex';
import { layer } from '../tokens/motion.stylex';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import { Statement } from '../components/Statement';
import { Badge } from '../components/Badge';
import { GridField } from '../components/GridField';
import { CopyField } from '../components/CopyField';
import { FactRow } from '../components/FactRow';
import { Section } from '../components/Section';
import { FamilyNav } from '../project/FamilyNav';
import { SiteFooter } from '../project/SiteFooter';
import packages from '../generated/packages.json';
import { COPY } from '../data/projects';

/**
 * One component for every package page.
 *
 * Seven hand-written pages drift; the content that genuinely differs per
 * package lives in data, and everything else — status, size, dependencies — is
 * read from the packages themselves at build time.
 */
const styles = stylex.create({
  app: {
    minHeight: '100vh',
    backgroundColor: colors.bgBase,
    color: colors.textPrimary,
    fontFamily: t.familyBody,
    fontSize: t.bodySize,
    lineHeight: t.leadingRelaxed,
  },
  head: {
    position: 'relative',
    overflow: 'hidden',
    paddingBlockStart: space.bay,
    paddingBlockEnd: space.section,
    borderBottomWidth: stroke.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  inner: { position: 'relative', zIndex: layer.raised },
  column: {
    maxWidth: '760px',
    display: 'flex',
    flexDirection: 'column',
    gap: space.gutter,
    alignItems: 'flex-start',
  },
  eyebrowRow: {
    display: 'flex',
    gap: space.snug,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pkg: {
    fontFamily: t.familyMono,
    fontSize: t.captionSize,
    color: colors.textMuted,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.roomy,
    maxWidth: '760px',
  },
  para: { display: 'flex', flexDirection: 'column', gap: space.snug },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    margin: space.none,
    padding: space.none,
  },
  item: {
    listStyle: 'none',
    paddingInlineStart: space.gutter,
    position: 'relative',
    fontSize: t.bodySize,
    color: colors.textMuted,
    lineHeight: t.leadingRelaxed,
  },
  bullet: {
    position: 'absolute',
    insetInlineStart: space.none,
    insetBlockStart: space.snug,
    width: space.tight,
    height: space.tight,
    borderRadius: radius.sharp,
    backgroundColor: colors.signal,
  },
  deps: { display: 'flex', gap: space.snug, flexWrap: 'wrap' },
  dep: {
    fontFamily: t.familyMono,
    fontSize: t.microSize,
    color: colors.accentText,
    borderWidth: stroke.hair,
    borderStyle: 'solid',
    borderColor: colors.accentSubtle,
    borderRadius: radius.sharp,
    paddingBlock: space.hair,
    paddingInline: space.tight,
    textDecoration: 'none',
  },
  notice: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.snug,
    padding: space.gutter,
    borderRadius: radius.round,
    borderInlineStartWidth: stroke.bold,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colors.warn,
    backgroundColor: colors.bgSurface,
  },
});

export function ProjectPage({ slug }: { slug: string }) {
  const meta = packages.find((p) => p.name === slug);
  const copy = COPY[slug] ?? null;

  // The spec is not a package, so it has no measured metadata.
  const written = meta ? meta.written : true;
  const title = meta?.pkg ?? 'The stylegraph format';

  const facts = meta
    ? [
        { value: meta.version, label: 'version' },
        {
          value: `${meta.files}`,
          label: meta.files === 1 ? 'source file' : 'source files',
        },
        { value: `${Math.max(1, Math.round(meta.bytes / 1024))} kB`, label: 'source' },
        { value: written ? 'yes' : 'not yet', label: 'written' },
      ]
    : [
        { value: 'v1', label: 'format version' },
        { value: 'JSON', label: 'on disk' },
        { value: 'stable', label: 'within v1' },
      ];

  return (
    <div {...stylex.props(styles.app)}>
      <FamilyNav current={slug} />

      <header {...stylex.props(styles.head)}>
        <GridField fade="top" />
        <Container style={styles.inner}>
          <div {...stylex.props(styles.column)}>
            <div {...stylex.props(styles.eyebrowRow)}>
              <Badge tone={written ? 'pass' : 'warn'}>
                {written ? 'written' : 'scaffolded'}
              </Badge>
              <span {...stylex.props(styles.pkg)}>{title}</span>
            </div>

            <Statement scale="mega" tail={copy?.tail}>
              {copy?.headline ?? meta?.description ?? title}
            </Statement>

            {meta ? <CopyField command={`npm i -D ${meta.pkg}`} /> : null}

            <FactRow facts={facts} ruled />
          </div>
        </Container>
      </header>

      <Section
        eyebrow="What it does"
        title={copy?.whatTitle ?? 'What it does'}
        grid="side"
      >
        <div {...stylex.props(styles.body)}>
          {(copy?.what ?? [meta?.description ?? '']).map((para) => (
            <div key={para} {...stylex.props(styles.para)}>
              <Text role="body">{para}</Text>
            </div>
          ))}

          {copy?.bullets?.length ? (
            <ul {...stylex.props(styles.list)}>
              {copy.bullets.map((b) => (
                <li key={b} {...stylex.props(styles.item)}>
                  <span {...stylex.props(styles.bullet)} aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          ) : null}

          {!written ? (
            <div {...stylex.props(styles.notice)}>
              <Text role="title">Not written yet</Text>
              <Text role="body">
                The package exists so the workspace, CI and the release process are in
                place before the code is. Its design lives on the roadmap rather than in
                a stub nobody agreed to.
              </Text>
            </div>
          ) : null}

          {meta?.dependsOn.length ? (
            <div {...stylex.props(styles.para)}>
              <Text role="caption">Depends on</Text>
              <div {...stylex.props(styles.deps)}>
                {meta.dependsOn.map((d) => (
                  <a
                    key={d}
                    href={`../${d.split('/')[1]}/`}
                    {...stylex.props(styles.dep)}
                  >
                    {d}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      <SiteFooter />
    </div>
  );
}
