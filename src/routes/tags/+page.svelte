<script lang="ts">
    import { browser } from '$app/environment';
    import { page } from '$app/state';
    import Seo from '$lib/components/Seo.svelte';
    import { getPostsByTag, getTagLabel, normalizeTag } from '$lib/posts';
    import Tag from '$lib/components/Tag.svelte';
    import { formatDate } from '$lib/utils';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    let requestedTag = $derived(browser ? (page.url.searchParams.get('tag') ?? '') : '');
    let selectedTag = $derived(normalizeTag(requestedTag));
    let selectedLabel = $derived(selectedTag ? getTagLabel(data.posts, selectedTag) : null);
    let matchingPosts = $derived(getPostsByTag(data.posts, selectedTag));
</script>

<Seo title="Tags" path="/tags" />

<main id="main" class="tags-page">
    <div class="tags-content">
        <section class="intro">
            <h1>Tags</h1>
            <p>
                {#if selectedLabel}
                    Posts tagged <strong>{selectedLabel}</strong>.
                {:else}
                    Browse posts by topic.
                {/if}
            </p>
        </section>

        <section class="tag-list" aria-labelledby="available-tags">
            <h2 id="available-tags">Available tags</h2>
            <ul aria-label="Available tags">
                {#each data.tags as tag (tag.slug)}
                    <li>
                        <Tag {tag} active={tag.slug === selectedTag} />
                    </li>
                {:else}
                    <li class="text-dim-foreground">No tags found.</li>
                {/each}
            </ul>
        </section>

        <section class="matching-posts" aria-labelledby="matching-posts">
            <div class="section-header">
                <h2 id="matching-posts">Posts</h2>
                <span>
                    {matchingPosts.length}
                    {matchingPosts.length === 1 ? 'entry' : 'entries'}
                </span>
            </div>

            <table class="post-table">
                <tbody>
                    {#each matchingPosts as post (post.slug)}
                        <tr>
                            <td>
                                <time datetime={post.publish_date}
                                    >{formatDate(post.publish_date)}</time
                                >
                            </td>
                            <td>
                                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- post.href is resolved in posts.ts -->
                                <a href={post.href}>{post.title}</a>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td class="empty-state" colspan="2">No matching posts.</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </section>
    </div>
</main>

<style>
    .tags-page {
        min-height: 100vh;
        background: var(--background);
    }

    .tags-content {
        max-width: 80ch;
        margin-inline: auto;
        padding: 2rem 1.5rem 5rem;
        color: var(--text-2);
        font-family: var(--font-monospace);
    }

    .intro {
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border);
    }

    h1,
    h2 {
        color: var(--text-1);
        font-size: 0.875rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        line-height: 1.25;
        text-transform: uppercase;
    }

    .intro p {
        margin-top: 0.75rem;
    }

    strong,
    .section-header span {
        color: var(--text-1);
    }

    .tag-list,
    .matching-posts {
        margin-top: 2rem;
    }

    .tag-list ul {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 0.75rem;
    }

    .tag-list li {
        list-style: none;
    }

    .section-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
    }

    .section-header span {
        font-size: 0.75rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .post-table {
        width: 100%;
        margin-top: 1rem;
        border-collapse: collapse;
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

    .empty-state {
        color: var(--text-2);
    }
</style>
