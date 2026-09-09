import * as stylex from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

// Token DEFINITIONS. The literals in here are the point, not violations.
export const colors = stylex.defineVars({
  fg: { default: '#101317', [DARK]: '#ECEEF2' },
  bg: { default: '#FFFFFF', [DARK]: '#0E1014' },
  accent: '#2A2FD6',
  unusedBorder: '#DDDDDD',
});

export const space = stylex.defineVars({
  sm: '4px',
  md: '8px',
  lg: '16px',
});
