import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

/**
 * Clean Architecture boundaries are enforced with `import/no-restricted-paths`
 * (mirrors arrow-maze-client). The `@/` alias resolves via the TypeScript resolver.
 */
export default tseslint.config(
  { ignores: ["dist/**", "coverage/**", "node_modules/**", ".stryker-tmp/**", "reports/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      import: pluginImport,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: "./tsconfig.json" },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            { target: "./src/domain", from: "./src/application", message: "Domain must not depend on application." },
            { target: "./src/domain", from: "./src/infrastructure", message: "Domain must not depend on infrastructure." },
            { target: "./src/domain", from: "./src/presentation", message: "Domain must not depend on presentation." },
            { target: "./src/domain", from: "./src/framework", message: "Domain must not depend on framework code." },
            { target: "./src/application", from: "./src/infrastructure", message: "Application must depend on ports, not infrastructure." },
            { target: "./src/application", from: "./src/presentation", message: "Application must not depend on presentation." },
            { target: "./src/application", from: "./src/framework", message: "Application must not depend on framework code." },
            { target: "./src/presentation", from: "./src/domain", message: "Presentation must consume application DTOs, not domain types." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}", "src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/*",
                "react-dom",
                "react-dom/*",
                "react-router",
                "react-router-dom",
                "@tanstack/react-query",
                "tailwindcss",
                "tailwindcss/*",
              ],
              message: "React/router/query/styling libraries are forbidden in domain and application layers.",
            },
          ],
        },
      ],
    },
  },
);
