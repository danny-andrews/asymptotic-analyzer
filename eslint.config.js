import globals from "globals";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
  },
  {
    ignores: ["**/dist/*"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
    },
  },
  eslintConfigPrettier,
];
