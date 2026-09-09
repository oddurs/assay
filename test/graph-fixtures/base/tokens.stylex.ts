import * as stylex from '@stylexjs/stylex';

export const palette = stylex.defineConsts({
  brand: '#7C5CFF',
  ink: '#111111',
});

// Semantic layer: components never touch the primitive directly, so blast
// radius only works if token -> token edges are followed.
export const colors = stylex.defineVars({
  accent: palette.brand,
  text: palette.ink,
});
