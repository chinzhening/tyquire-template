<script lang="ts">
    import { base } from '$app/paths';
    import {
        description as siteDescription,
        siteUrl,
        socialImageUrl,
        title as siteTitle
    } from '$lib/config';

    interface Props {
        title: string;
        description?: string;
        path: string;
        type?: 'article' | 'website';
        publishedAt?: string;
    }

    let {
        title,
        description = siteDescription,
        path,
        type = 'website',
        publishedAt
    }: Props = $props();

    const pageTitle = $derived(title === siteTitle ? siteTitle : `${title} | ${siteTitle}`);
    const canonicalPath = $derived(`${base}${path}`);
    const canonicalUrl = $derived(
        siteUrl ? new URL(canonicalPath, `${siteUrl.replace(/\/+$/, '')}/`).toString() : undefined
    );
    const imageUrl = $derived(socialImageUrl || undefined);
</script>

<svelte:head>
    <title>{pageTitle}</title>
    <meta name="description" content={description} />
    {#if canonicalUrl}
        <link rel="canonical" href={canonicalUrl} />
    {/if}
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    {#if canonicalUrl}
        <meta property="og:url" content={canonicalUrl} />
    {/if}
    {#if imageUrl}
        <meta property="og:image" content={imageUrl} />
    {/if}
    <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={description} />
    {#if imageUrl}
        <meta name="twitter:image" content={imageUrl} />
    {/if}
    {#if type === 'article' && publishedAt}
        <meta property="article:published_time" content={publishedAt} />
    {/if}
</svelte:head>
