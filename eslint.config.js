import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      'site/dist/**',
      'site/src/generated/**',
      // Fixtures are inputs to the analyser, not code we ship. They contain
      // deliberate violations — linting them would be linting the test data.
      'test/fixtures/**',
      'test/contrast-fixtures/**',
      'test/resolve-fixtures/**',
      'test/graph-fixtures/**',
      'test/bug-fixtures/**',
    ],
  },
  js.configs.recommended,
  {
    files: [
      'packages/**/*.{js,mjs}',
      'scripts/**/*.{js,mjs}',
      'test/**/*.mjs',
      'site/scripts/**/*.mjs',
      'eslint.config.js',
    ],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: ['site/**/*.{ts,tsx}'],
  })),
  {
    // Build config runs in node, not the browser.
    files: ['site/vite.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['site/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
