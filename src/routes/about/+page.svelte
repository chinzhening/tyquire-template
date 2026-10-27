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
                I love Typst because its markup is concise and it handles the things I need in
                technical writing: mathematics, scripting, and diagrams.
            </p>
            <p>
                I wanted the same source to work directly on the web and seeing that Typst's HTML
                export and MathML support has matured significantly in the past year, I decided to
                put together a blog template built on SvelteKit that can render Typst content.
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
