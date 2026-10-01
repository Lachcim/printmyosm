import { defineConfig } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import globals from "globals";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    {
        extends: fixupConfigRules(compat.extends(
            "eslint:recommended",
            "plugin:react/recommended",
            "plugin:react-hooks/recommended",
        )),
        plugins: {
            react: fixupPluginRules(react),
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            "eol-last": ["error", "always"],
            indent: ["error", 4, {
                SwitchCase: 1,
            }],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "no-empty": ["error", { "allowEmptyCatch": true }],
            "array-bracket-spacing": ["error", "never"],
            "object-curly-spacing": ["error", "always"],
            "no-constant-condition": ["error", {
                checkLoops: false,
            }],
            "react/prop-types": ["off"],
            "react/jsx-curly-spacing": ["error", {
                when: "never",

                children: {
                    when: "always",
                },
            }],
        },
    },
    {
        files: ["**/*.{js,jsx}"]
    }
]);
