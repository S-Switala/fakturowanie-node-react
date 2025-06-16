module.exports = {
  // ...
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier', // <-- wyłącza konfliktujące reguły ESLint
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error', // <- wymusza styl Prettier jako błędy
  },
};
