const { defineConfig } = require("eslint/config");
const expo = require("eslint-config-expo/flat");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettier = require("eslint-config-prettier");

module.exports = defineConfig([
  // Base ESLint config for
  ...expo,
  // Ignore build and dependency folders
  {
    ignores: [
      "**/node_modules/**",
      "**/.expo/**",
      "**/dist/**",
      "**/build/**",
      "**/android/**",
      "**/ios/**",
    ],
  },
  // TypeScript-specific rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: true,
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "eqeqeq": ["error", "smart"],
      "curly": ["error", "all"],
      "no-console": ["warn", { allow: ["warn","error"] }],
    },
  },
  // Prettier should be the last to override other formatting rules
  ...(Array.isArray(prettier) ? prettier : [prettier]),
]);
