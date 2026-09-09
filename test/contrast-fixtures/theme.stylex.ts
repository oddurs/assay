import * as stylex from '@stylexjs/stylex';

export const c = stylex.defineVars({
  ink: '#111111',
  paper: '#ffffff',
  faint: '#bbbbbb',
  brand: '#7C5CFF',
});

export const t = stylex.defineVars({
  big: '32px',
  small: '13px',
  heavy: '700',
});

// A semantic layer pointing at the raw one — the chain the resolver must follow.
export const semantic = stylex.defineVars({
  fg: c.ink,
  bg: c.paper,
});
