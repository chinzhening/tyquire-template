<script lang="ts">
    import * as config from '$lib/config';
</script>

<svelte:head>
    <title>{config.title}</title>
</svelte:head>

<main id="main" class="page-prose">
    <div class="page-content">
        <h1>1. Introduction</h1>
        <p>Tyquire is a minimal blog template built with SvelteKit and Typst.</p>
        <ul>
            <li>Typst v0.15.0</li>
            <li>Svelte 5 and SvelteKit 2</li>
        </ul>
        <h1>2. Features</h1>
        <p></p>
        <ul>
            <li>
                Typst authored blog posts. Diagrams, math, and other rich content created with Typst
                is supported out of the box.
            </li>
            <li>
                Typst-svelte interop. Typst authored content can be rendered as Svelte components,
                allowing for
            </li>
            <li>Easily extensible.</li>
            <li>Configurable `shiki` syntax highlighting for code blocks.</li>
            <li>
                Clean design following Shibui (渋い) aesthetics. The default theme is inspired by
                the <a href="https://ntk148v.github.io/shibui/">Shibui</a>
                hugo template.
            </li>
            <li>Light/dark theme support.</li>
            <li>Mobile responsive layout.</li>
        </ul>
        <h1>3. About Tyquire</h1>
        <p>
            Tyquire is a small publishing system for technical writing. It brings together Typst for
            authoring and SvelteKit for delivering a fast, static site.
        </p>
        <p>
            Typst makes the source pleasant to write, especially for mathematics, diagrams, and
            structured documents. The same content can be authored without embedding details about
            how it will eventually be rendered.
        </p>
        <p>
            Behind the scenes, the <code>tyquire</code> Vite plugin turns Typst's HTML export into a typed
            tree. Svelte components then render that tree, keeping content, parsing, and presentation
            separate.
        </p>
        <p>
            The project grew out of the process of building this blog and continues to be shaped by
            practical engineering tradeoffs. It is intended to stay small, inspectable, and easy to
            extend as new kinds of content and output are needed.
        </p>
    </div>
</main>
