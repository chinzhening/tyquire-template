<script lang="ts">
    import { formatDate } from '$lib/utils';
    import Seo from '$lib/components/Seo.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<Seo title="Posts" path="/posts" />

<main id="main" class="posts-page">
    <section class="posts-content">
        <header class="posts-header">
            <h1>Posts</h1>
            <p>Notes on software, tools, and technical writing.</p>
        </header>
        <table class="post-table">
            <tbody>
                {#each data.posts as post (post.slug)}
                    <tr>
                        <td
                            ><time datetime={post.publish_date}
                                >{formatDate(post.publish_date)}</time
                            ></td
                        >
                        <td>
                            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- post.href is resolved in posts.ts -->
                            <a href={post.href}>{post.title}</a>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </section>
</main>

<style>
    .posts-page {
        min-height: 100vh;
        background: var(--background);
    }

    .posts-content {
        max-width: 80ch;
        margin-inline: auto;
        padding: 2rem 1.5rem 5rem;
    }

    .posts-header {
        padding-bottom: 1.5rem;
        font-family: var(--font-monospace);
    }

    h1 {
        color: var(--text-1);
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        line-height: 1.25;
        text-transform: uppercase;
    }

    .posts-header p {
        margin-top: 0.75rem;
        color: var(--text-2);
    }

    .post-table {
        width: 100%;
        margin-top: 1.5rem;
        border-collapse: collapse;
        font-family: var(--font-monospace);
    }

    .post-table td {
        padding: 0.75rem 0;
        text-align: left;
    }

    .post-table td:first-child {
        width: 7rem;
        color: var(--text-2);
        font-size: 0.75rem;
    }
</style>
