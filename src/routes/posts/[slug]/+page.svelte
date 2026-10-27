<script lang="ts">
    import '$lib/css/article.css';

    import Seo from '$lib/components/Seo.svelte';
    import Tag from '$lib/components/Tag.svelte';
    import PostNavigation from '$lib/components/PostNavigation.svelte';
    import { components } from '$lib/components/article/components';
    import { formatDate, toKebabCase } from '$lib/utils';
    import TypstRenderer from '$tyquire/svelte/TypstRenderer.svelte';

    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
    let { metadata, children: nodes, prevPost, nextPost } = $derived(data);
</script>

<Seo
    title={metadata.title}
    description={metadata.desc}
    path={`/posts/${data.slug}`}
    type="article"
    publishedAt={metadata.publish_date}
/>

<div class="relative text-foreground min-h-screen">
    <main id="main" class="pt-8 pb-12 md:pt-16">
        <article class="mx-auto max-w-[80ch] px-6">
            <div class="mb-4 border-b border-border pl-2">
                <header>
                    <!-- Post Title -->
                    <h1
                        class="font-monospace text-2xl font-medium tracking-tighter text-balance md:text-3xl"
                    >
                        {metadata.title}
                    </h1>

                    <!-- Description -->
                    {#if metadata.desc}
                        <p class="mt-2 font-monospace">{metadata.desc}</p>
                    {/if}

                    <!-- Tags -->
                    {#if metadata.tags.length}
                        <div class="mt-2 px-2 relative z-10 flex text-xs font-monospace">
                            <ul aria-label="Post tags" class="flex gap-3">
                                {#each metadata.tags as tag (tag)}
                                    <li>
                                        <Tag tag={{ slug: tag, label: toKebabCase(tag) }} />
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}

                    <dl
                        class="relative z-10 mb-2 px-2 flex flex-col gap-2 py-4 text-sm font-monospace uppercase tracking-wider"
                    >
                        <div
                            class="
                            grid grid-cols-[3.75rem_minmax(0,1fr)]
                            items-center gap-2"
                        >
                            <dt>date:</dt>
                            <dd>
                                <time datetime={metadata.publish_date}
                                    >{formatDate(metadata.publish_date)}</time
                                >
                            </dd>
                        </div>
                        {#if metadata.edited_date}
                            <div
                                class="
                            grid grid-cols-[3.75rem_minmax(0,1fr)]
                            items-center gap-2"
                            >
                                <dt>edited:</dt>
                                <dd>
                                    <time datetime={metadata.edited_date}
                                        >{formatDate(metadata.edited_date)}</time
                                    >
                                </dd>
                            </div>
                        {/if}
                    </dl>
                </header>
            </div>

            <!-- Post Content -->
            <div class="typst mx-auto text-muted-foreground leading-relaxed">
                <svelte:boundary onerror={(error) => console.error('post render failed', error)}>
                    <TypstRenderer {nodes} {components} />

                    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
                    {#snippet failed(error, reset)}
                        <p role="alert">
                            This post failed to render.
                            <button type="button" onclick={reset}>Try again</button>
                        </p>
                    {/snippet}
                </svelte:boundary>
            </div>
        </article>
    </main>
    <div class="container mx-auto px-6 max-w-[80ch]">
        <PostNavigation {prevPost} {nextPost} />
    </div>
</div>
