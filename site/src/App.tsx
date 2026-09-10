import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from './tokens/color.stylex';
import { space } from './tokens/space.stylex';
import { type as t } from './tokens/type.stylex';
import { motion } from './tokens/motion.stylex';
import { THEMES, type ThemeId } from './themes/themes';
import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { Family } from './sections/Family';
import { Gap } from './sections/Gap';
import { Measures } from './sections/Measures';
import { Dogfood } from './sections/Dogfood';
import { System } from './sections/System';
import { Themes } from './sections/Themes';
import { Roadmap } from './sections/Roadmap';
import { Install } from './sections/Install';
import { Footer } from './sections/Footer';

const styles = stylex.create({
  app: {
    minHeight: '100vh',
    backgroundColor: colors.bgBase,
    color: colors.textPrimary,
    fontFamily: t.familyBody,
    fontSize: t.bodySize,
    lineHeight: t.leadingRelaxed,
    // The whole page transitions when the theme changes — the demo is the site.
    transitionProperty: 'background-color, color',
    transitionDuration: motion.smooth,
    transitionTimingFunction: motion.easeStandard,
  },
  main: { display: 'flex', flexDirection: 'column', paddingBlockEnd: space.none },
});

export function App() {
  const [theme, setTheme] = useState<ThemeId>('midnight');
  const active = THEMES.find((th) => th.id === theme);

  // The theme bundle is a class name; merge it with the app's own styles.
  const app = stylex.props(styles.app);

  return (
    <div
      className={[active?.className, app.className].filter(Boolean).join(' ')}
      style={app.style}
    >
      <Nav />
      <main {...stylex.props(styles.main)}>
        <Hero />
        <Family />
        <Gap />
        <Measures />
        <Dogfood />
        <System />
        <Themes theme={theme} onTheme={setTheme} />
        <Roadmap />
        <Install />
      </main>
      <Footer />
    </div>
  );
}
