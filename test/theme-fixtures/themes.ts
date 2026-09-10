import * as stylex from '@stylexjs/stylex';
import { c, radii } from './t.stylex';

// Passes in the base theme (#111 on #fff) and fails under this one: the ink
// becomes a pale grey that no longer carries on paper. Exactly the class of bug
// that shipped unnoticed on our own site.
export const washed = stylex.createTheme(c, {
  ink: '#BBBBBB',
});

// Overrides no colour at all, so it can never change a contrast verdict and
// must not be reported as if it were checked.
export const softer = stylex.createTheme(radii, {
  round: '16px',
});
