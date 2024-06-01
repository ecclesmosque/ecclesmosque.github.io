import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    ignores: ['assets/', '_site'],
  },
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
];
