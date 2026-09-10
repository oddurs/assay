/**
 * The per-package prose. Everything measurable — status, size, version,
 * dependencies — is read from the packages at build time instead of living
 * here, so this file can only ever be wrong about opinions.
 */
export type ProjectCopy = {
  headline: string;
  tail?: string;
  whatTitle?: string;
  what: string[];
  bullets?: string[];
};

export const COPY: Record<string, ProjectCopy> = {
  spec: {
    headline: 'The format, and the code that validates it.',
    tail: 'Everything else here is downstream of it.',
    what: [
      'A description of every style in a codebase and where each value came from: which token a declaration resolved to, which literal it did not, and which values are genuinely unknowable at build time.',
      'It is versioned separately from every package that reads it, because the format is the durable thing and a tool is one implementation of it.',
    ],
    bullets: [
      'Portable: every path is relative to the analysed root, so a graph built in CI compares cleanly with one built on a laptop',
      'Deterministic: sorted keys and a per-unit content hash, so a diff is a hash comparison and moving code is not a change',
      'Honest: a producer that cannot classify a value must say so rather than guess',
    ],
  },
  extract: {
    headline: 'Reads StyleX source, produces a graph.',
    tail: 'The only package here that knows what StyleX is.',
    what: [
      'Walks stylex.create, defineVars, defineConsts and createTheme, resolving every declaration to the token it came from — through tsconfig path aliases, bracket access on custom-property names, and chains from semantic tokens down to primitives.',
      'Everything above it in the family reads the graph, not your source. That boundary is why a second producer for another compile-time styling system is possible rather than merely promised.',
    ],
  },
  audit: {
    headline: 'Judges what the graph found.',
    tail: 'Conformance, contrast, dead tokens, blast radius.',
    what: [
      'Producing a graph is a fact; deciding whether it is acceptable is an opinion, and opinions belong where they can be configured and argued with.',
      'The score is not every declaration. A property that cannot carry a design token is never counted against you, and a runtime value is reported in its own category rather than folded into a pass or a fail.',
    ],
    bullets: [
      'Contrast on the pairings that actually render, checked under every theme',
      'Blast radius that follows token-to-token edges, so changing a primitive reports what it truly reaches',
      'A gate for CI that fails on regression rather than on a threshold you forgot',
    ],
  },
  tokens: {
    headline: 'A bridge to the rest of the industry.',
    tail: 'W3C design tokens, both directions.',
    what: [
      'The Design Tokens Community Group format went stable in October 2025, and Figma, Sketch, Penpot, Tokens Studio, Style Dictionary and Terrazzo all read it. StyleX speaks none of it.',
      'Today a team choosing StyleX is choosing to hand-maintain their token pipeline. This is the package that ends that.',
    ],
  },
  variants: {
    headline: 'Variants the graph can see.',
    tail: 'Compile-time, typed, and visible to everything else here.',
    what: [
      'Every design system needs size, tone and state APIs. StyleX has no equivalent of the runtime variant libraries, so teams hand-roll conditional style arrays that the analyser reads as ordinary declarations.',
      'Done at compile time, a variant can be typed and recorded in the graph — which no runtime variant library can offer.',
    ],
  },
  test: {
    headline: 'Assert on tokens, not class names.',
    what: [
      'A StyleX snapshot is a list of atomic class names. `x1e2nbdu` tells a reviewer nothing, so style assertions get skipped or written against generated names that churn on every compile.',
      'Matchers that resolve through the graph, a serializer that renders atomic classes back into the declarations they encode, and a runner that executes a suite under every theme.',
    ],
  },
  mcp: {
    headline: 'The design system, answerable.',
    tail: 'An agent surface over the graph.',
    what: [
      'An agent editing a design system has no way to ask which tokens exist or whether a change conforms, so it guesses, and guesses drift.',
      'Read-only by design: it answers questions about the graph and never writes to your repository.',
    ],
  },
};
