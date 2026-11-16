import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

import tyquire, { shikiHighlight } from '#tyquire';

const basePath = process.env.BASE_PATH?.replace(/\/$/, '');

const base: '' | `/${string}` =
    process.argv.includes('dev') || !basePath
        ? ''
        : basePath.startsWith('/')
            ? (basePath as `/${string}`)
            : `/${basePath}`;

export default defineConfig({
    plugins: [
        tyquire({
            fontPaths: process.env.TYPST_FONT_PATH ? [process.env.TYPST_FONT_PATH] : [],
            transforms: [
                shikiHighlight({
                    theme: { light: 'min-light', dark: 'everforest-dark' }
                })
            ]
        }),
        tailwindcss(),
        sveltekit({
            compilerOptions: {
                // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
                runes: ({ filename }) =>
                    filename.split(/[/\\]/).includes('node_modules') ? undefined : true
            },
            adapter: adapter({ fallback: '404.html' }),
            paths: { base }
        })
    ]
});
