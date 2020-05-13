module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["eslint:recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: false
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {}
};
