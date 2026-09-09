import * as stylex from '@stylexjs/stylex';
import { c } from './t.stylex';

const styles = stylex.create({
  // Invisible at rest: light on light by default, only readable on :hover.
  // Merging conditions reported this as a 14.59:1 PASS.
  tricky: {
    color: { default: c.light, ':hover': c.dark },
    backgroundColor: c.light,
  },
  // Zero needs no token, whatever unit is attached.
  zeros: { padding: '0px', margin: '0rem', borderRadius: '0', gap: 0 },
  // Has both tokens and literals — allow-listing must remove BOTH sides.
  mixed: { color: c.dark, padding: '9px' },
});

const glass = stylex.create({
  // A translucent backdrop: the effective background depends on what is behind
  // the panel, so this must be reported as unresolvable — never a pass or fail.
  plate: { color: c.dark, backgroundColor: 'rgba(255, 255, 255, 0.04)' },
});
