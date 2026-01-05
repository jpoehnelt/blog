import prettier from "eslint-config-prettier";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";
import svelteParser from "svelte-eslint-parser";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  {
    files: ["**/*.svelte.ts", "**/*.ts"],
    languageOptions: {
      parser: ts.parser,
    },
  },
  {
    ignores: [
      "build/",
      ".svelte-kit/",
      "dist/",
      ".turbo/",
      "src/content/posts/snippets/",
      "src/lib/components/JsonLd.svelte",
    ],
  },
  // Overrides to relax strict rules for existing code
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "svelte/no-navigation-without-resolve": "off",
      "svelte/require-each-key": "off",
      "svelte/prefer-svelte-reactivity": "off",
      "svelte/no-at-html-tags": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-useless-escape": "off",
      "no-undef": "off",
      "prefer-const": "off",
    },
  },
);
