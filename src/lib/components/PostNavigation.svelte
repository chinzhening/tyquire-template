<script lang="ts">
    import { resolve } from '$app/paths';
    import { prefersReducedMotion } from 'svelte/motion';
    import type { PostSummary } from '$lib/posts';

    let {
        prevPost = null,
        nextPost = null
    }: { prevPost?: PostSummary | null; nextPost?: PostSummary | null } = $props();

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: prefersReducedMotion.current ? 'auto' : 'smooth'
        });
    }
</script>

{#snippet postLink(post: PostSummary, direction: 'previous' | 'next')}
    <!-- eslint-disable svelte/no-navigation-without-resolve -- already resolved, in posts.ts:20 -->
    <a
        class:previous={direction === 'previous'}
        class:next={direction === 'next'}
        class="nav-link"
        href={post.href}
    >
        <span class="nav-label">
            {direction === 'previous' ? '« previous post' : 'next post »'}
        </span>
        <span class="nav-title">{post.title}</span>
    </a>
    <!-- eslint-enable svelte/no-navigation-without-resolve -->
{/snippet}

<nav class="post-navigation" aria-label="Post navigation">
    <div class="navigation-grid">
        {#if prevPost}
            {@render postLink(prevPost, 'previous')}
        {:else}
            <div class="navigation-placeholder" aria-hidden="true"></div>
        {/if}

        <div class="navigation-tools">
            <button type="button" class="utility-link" onclick={scrollToTop}>top</button>
            <a class="utility-link" href={resolve('/posts')}>posts</a>
        </div>

        {#if nextPost}
            {@render postLink(nextPost, 'next')}
        {:else}
            <div class="navigation-placeholder" aria-hidden="true"></div>
        {/if}
    </div>
</nav>

<style>
    .post-navigation {
        margin-top: 3rem;
        overflow: hidden;
        border-top: 1px solid var(--border);
    }

    .navigation-grid {
        display: grid;
        gap: 0;
        align-items: stretch;
        grid-template-columns: minmax(0, 1fr);
    }

    .nav-link {
        display: flex;
        min-height: 5.5rem;
        width: 100%;
        flex-direction: column;
        justify-content: center;
        gap: 0.45rem;
        padding: 0.85rem 1rem;
        color: var(--text-1);
        border: none;
        transition:
            color 0.2s ease,
            translate 0.2s ease;
    }

    .nav-link.previous {
        text-align: left;
    }

    .nav-link.next {
        text-align: right;
    }

    .nav-label,
    .utility-link {
        font-family: var(--font-monospace);
        font-size: 0.68rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        border: none;
    }

    .nav-label {
        color: var(--text-2);
        transition: translate 0.2s ease;
    }

    .nav-title {
        font-family: var(--font-monospace);
        font-size: clamp(0.875rem, 1.5vw, 1rem);
        line-height: 1.2;
        text-wrap: balance;
    }

    .navigation-tools {
        display: flex;
        min-height: 5.5rem;
        height: 100%;
        align-items: stretch;
        justify-content: center;
        gap: 1rem;
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
    }

    .utility-link {
        display: inline-flex;
        flex: 1 1 0;
        width: 3rem;
        min-height: 3.75rem;
        align-items: center;
        justify-content: center;
        color: var(--text-2);
        cursor: pointer;
        text-decoration: none;
        transition: color 0.2s ease;
    }

    .utility-link + .utility-link {
        padding-left: 1rem;
        border-left: 1px solid var(--border);
    }

    .nav-link:hover,
    .nav-link:focus-visible,
    .utility-link:hover,
    .utility-link:focus-visible {
        color: var(--text-1);
    }

    .nav-link.previous:hover .nav-label,
    .nav-link.previous:focus-visible .nav-label {
        translate: -0.35em 0;
    }

    .nav-link.next:hover .nav-label,
    .nav-link.next:focus-visible .nav-label {
        translate: 0.35em 0;
    }

    .nav-link:focus-visible,
    .utility-link:focus-visible {
        outline: 1px solid var(--text-1);
        outline-offset: -2px;
    }

    @media (min-width: 48rem) {
        .navigation-grid {
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        }

        .navigation-tools {
            min-height: 0;
            align-items: stretch;
            border: 0;
            border-right: 1px solid var(--border);
            border-left: 1px solid var(--border);
            padding-inline: 1rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .nav-link,
        .nav-label,
        .utility-link {
            transition: none;
        }

        .nav-link.previous:hover .nav-label,
        .nav-link.previous:focus-visible .nav-label,
        .nav-link.next:hover .nav-label,
        .nav-link.next:focus-visible .nav-label {
            translate: none;
        }
    }
</style>
