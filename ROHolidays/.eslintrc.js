module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript', 'prettier'],
  plugins: ['simple-import-sort', 'import'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'import/order': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Keep JSX/TS imports first for readability
  },
};
