import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  // GitHub project pages serve from /<repo>/, not the domain root. CI sets
  // BASE_PATH; local builds and dev stay at the root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [stylex.vite(), react()],
});
