import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
    includeIgnoreFile(gitignorePath),
    js.configs.recommended,
    ts.configs.recommended,
    svelte.configs.recommended,
    prettier,
    svelte.configs.prettier,
    {
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        rules: {
            // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
            // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
            'no-undef': 'off'
        }
    },
    {
        files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
        languageOptions: {
            parserOptions: {
                projectService: {
                    // The renderer lives under plugins/, which is deliberately
                    // outside the app tsconfig's include, so the project service
                    // cannot place it on its own.
                    allowDefaultProject: ['plugins/tyquire/src/svelte/*.svelte']
                },
                extraFileExtensions: ['.svelte'],
                parser: ts.parser,
                svelteConfig
            }
        }
    },
    {
        files: ['**/*.svelte'],
        rules: {
            // Every `{@html}` here renders build-time Typst output from this
            // repo's own pipeline, never user input, so the XSS premise does
            // not apply. Revisit if untrusted content is ever rendered.
            'svelte/no-at-html-tags': 'off'
        }
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            // Ambient augmentation (SvelteKit's App.*, tyquire's Tyquire.Metadata)
            // is declared via empty interfaces merged into by consumers, and a
            // client.d.ts entry point needs a triple-slash reference since it has
            // no runtime exports for `import type` to hang off.
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/triple-slash-reference': 'off',
            '@typescript-eslint/no-unused-vars': 'off'
        }
    },
    {
        files: ['plugins/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['$lib', '$lib/*', '$app', '$app/*', '$tyquire'],
                            message:
                                'plugins/ is extracted as a standalone package and must not import app-space aliases.'
                        }
                    ]
                }
            ]
        }
    }
);
