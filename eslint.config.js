import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import boundariesPlugin from 'eslint-plugin-boundaries';

export default [
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      boundaries: boundariesPlugin
    },
    rules: {
      // Enforce absolute imports from 'src/'
      // 'no-restricted-imports': [
      //   'error',
      //   {
      //     patterns: [
      //       '../*',
      //       '../../*',
      //       '../../../*', // add more if needed
      //     ]
      //   }
      // ],

      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[source.value=/^(\\.|\\.\\.)/]",
          message: "Only absolute imports from 'src/' are permitted."
        }
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn'
    }
  }
];
