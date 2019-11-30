module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'prettier'
  ],
  plugins: [
    'prettier'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "prettier/prettier": "error",
    "class-methods-use-this": "off",
    //"no-param-reassing": "off",
    "no-param-reassign": [2, {"props": false}],
    "camelcase": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "next"}],
    "linebreak-style": "off",
    "import/prefer-default-export": "off"
  },
};
