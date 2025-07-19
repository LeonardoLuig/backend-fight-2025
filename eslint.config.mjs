import js from '@eslint/js';
import node from 'eslint-plugin-n';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      n: node,
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      eqeqeq: ['error', 'always'],
      'n/no-missing-import': 'error',
      'n/no-unsupported-features/es-syntax': 'off',
    },
  },
];
