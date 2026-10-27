<script lang="ts">
    import '$lib/css/app.css';
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';

    let { children } = $props();
</script>

<div>
    <a class="skip-link" href="#main">Skip to content</a>
    <Header />
    {@render children()}
    <Footer />
</div>

<style>
    /* Fixed, not absolute: an absolutely positioned link sits at the document
       top and would open off-screen when focused part-way down a post. */
    .skip-link {
        position: fixed;
        top: -4rem;
        left: 0.5rem;
        z-index: 50;
        padding: 0.5rem 1rem;
        border: 1px solid var(--border);
        background: var(--surface-1);
        color: var(--text-1);
        font-family: var(--font-monospace);
        font-size: 0.8rem;
        letter-spacing: 0.05rem;
        text-transform: uppercase;
        transition: top 0.2s ease;
    }

    .skip-link:focus {
        top: 0.5rem;
    }

    @media (prefers-reduced-motion: reduce) {
        .skip-link {
            transition: none;
        }
    }
</style>
