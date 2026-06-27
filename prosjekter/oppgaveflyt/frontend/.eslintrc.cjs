module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project: "./tsconfig.json", ecmaFeatures: { jsx: true } },
  plugins: ["@typescript-eslint", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  env: { browser: true, es2022: true },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
