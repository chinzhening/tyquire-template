<script lang="ts">
    import * as config from '$lib/config';
</script>

<svelte:head>
    <title>About | {config.title}</title>
</svelte:head>

<main id="main" class="page-prose">
    <div class="page-content">
        <header>
            <h1>About Tyquire</h1>
            <p>
                This template uses Typst because its markup is concise and handles the needs of
                technical writing: mathematics, scripting, and diagrams.
            </p>
            <p>
                It is designed to render the same source directly on the web, combining Typst's HTML
                export and MathML support with SvelteKit to produce a static blog.
            </p>
            <p>
                At its core Tyquire is simply a Vite plugin that connects Typst to this site. It
                turns the HTML export into a typed tree that Svelte components can render via
                snippets.
            </p>
            <p>
                The result is a blog where posts stay in Typst, while the site controls how their
                content is presented.
            </p>
        </header>
    </div>
</main>
