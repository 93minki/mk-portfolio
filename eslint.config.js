import { createRequire } from "node:module";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

const require = createRequire(import.meta.url);
const tsParser = createRequire(require.resolve("typescript-eslint")).resolve("@typescript-eslint/parser");
const sourceFiles = ["**/*.{js,jsx,ts,tsx}"];
const tsFiles = ["**/*.{ts,tsx}"];

export default [
  { ignores: ["build/", ".react-router/", "node_modules/", "data/", "backup/"] },
  js.configs.recommended,
  {
    files: sourceFiles,
    languageOptions: { globals: globals.browser },
    settings: {
      react: { version: "detect" },
      formComponents: ["Form"],
      linkComponents: [
        { name: "Link", linkAttribute: "to" },
        { name: "NavLink", linkAttribute: "to" },
      ],
      "import/resolver": { typescript: {} },
    },
  },
  ...[react.configs.flat.recommended, react.configs.flat["jsx-runtime"], reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.recommended].map(config => ({ ...config, files: sourceFiles })),
  ...tseslint.configs.recommended.map(config => ({ ...config, files: tsFiles })),
  { ...importPlugin.flatConfigs.recommended, files: tsFiles },
  {
    ...importPlugin.flatConfigs.typescript,
    files: tsFiles,
    settings: {
      ...importPlugin.flatConfigs.typescript.settings,
      "import/parsers": { [tsParser]: [".ts", ".cts", ".mts", ".tsx"] },
    },
  },
  {
    files: tsFiles,
    settings: {
      "import/internal-regex": "^~/",
      "import/resolver": {
        node: { extensions: [".ts", ".tsx"] },
        typescript: { alwaysTryTypes: true },
      },
    },
  },
  {
    files: ["app/hooks/useDarkMode.ts"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  {
    files: ["scripts/**/*.{js,cjs,mjs,ts}", "*.config.{js,cjs,mjs,ts}"],
    languageOptions: { globals: globals.node },
  },
];
