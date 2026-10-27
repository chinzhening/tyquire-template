import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

import tyquire, { shikiHighlight } from './plugins/tyquire/src/index.ts';

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
        sveltekit()
    ]
});
