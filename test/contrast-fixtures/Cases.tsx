import * as stylex from '@stylexjs/stylex';
import { c, t, semantic } from './theme.stylex';

const styles = stylex.create({
  // 1. passes easily: #111 on #fff is ~18.9:1
  good: { color: c.ink, backgroundColor: c.paper },

  // 2. fails AA normal text: #bbb on #fff is ~1.9:1
  faint: { color: c.faint, backgroundColor: c.paper, fontSize: t.small },

  // 3. large text relaxes the requirement to 3.0 — brand on white is ~4.0:1,
  //    so this passes as large and would fail as normal.
  largeBrand: { color: c.brand, backgroundColor: c.paper, fontSize: t.big },

  // 4. same colours, normal size → fails
  smallBrand: { color: c.brand, backgroundColor: c.paper, fontSize: t.small },

  // 5. no background declared here — not checkable, must not be a pass
  inherited: { color: c.ink },
});

const chained = stylex.create({
  // resolves semantic.fg -> c.ink -> '#111111'
  viaChain: { color: semantic.fg, backgroundColor: semantic.bg },
});
