# Tyquire

Tyquire is a Vite plugin that turns Typst files into modules consumable by
Svelte. It compiles Typst HTML output, extracts a labelled metadata value, and
converts the document into a typed tree rendered by Svelte components.

The plugin is used by the blog template in the repository root. It is
currently private and is not published as an npm package.

## Requirements

- Node.js 22 or newer
- Typst 0.15.0 or newer with HTML export support
- Vite 8

## Usage

Add the plugin to `vite.config.ts`:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import tyquire, { shikiHighlight } from './plugins/tyquire/src/index.ts';

export default defineConfig({
    plugins: [
        tyquire({
            transforms: [
                shikiHighlight({
                    theme: { light: 'min-light', dark: 'everforest-dark' }
                })
            ]
        }),
        sveltekit()
    ]
});
```

The plugin handles `.typ` files imported from the application. Each compiled
module exports:

- `metadata`, the value extracted from the post's `<metadata>` label.
- `default`, an array of `TypstNode` values for the Svelte renderer.

## Metadata

The shared blog helpers emit metadata with this shape:

```ts
interface PostMetadata {
    title: string;
    desc: string;
    published: boolean;
    publish_date: string;
    edited_date?: string;
    tags: string[];
}
```

Tyquire validates the serialized Typst query envelope and reports the source
file when the query cannot be parsed or contains no metadata value. The
The blog template additionally validates this concrete schema when it loads
posts. Invalid field types, missing required values, invalid dates, empty tag
values, or an `edited_date` earlier than `publish_date` produce an error that
identifies the source file. Other consumers should provide equivalent
application-specific validation for their own metadata schema.

## Svelte rendering

Use `TypstRenderer` with a component registry to render the compiled nodes:

```svelte
<script lang="ts">
    import { components } from '$lib/components/article/components';
    import TypstRenderer from '$tyquire/svelte/TypstRenderer.svelte';

    let { nodes } = $props();
</script>

<TypstRenderer {nodes} {components} />
```

Article components are emitted by Typst helpers as named markers. Register a
Svelte component under the same name to customize how that marker renders.
Component props, named slots, child nodes, and a `renderNodes` helper are
available through `TypstComponentProps`.

## Development

From the repository root:

```sh
npm run check
npm run build
```

The plugin depends on Typst's HTML export, which is still experimental. Build
warnings from Typst are therefore expected until that export stabilizes.
