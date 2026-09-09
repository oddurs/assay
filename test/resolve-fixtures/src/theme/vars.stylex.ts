import * as stylex from '@stylexjs/stylex';

// CSS-custom-property names as token keys: only readable via bracket access.
export const vars = stylex.defineVars({
  '--color-fg': '#101010',
  '--space-md': '12px',
  unusedOne: '#abcdef',
});
