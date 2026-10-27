<script lang="ts">
    import { getTagHref } from '$lib/posts';

    import type { TagSummary } from '$lib/posts';

    let {
        tag,
        active = false
    }: {
        tag: Omit<TagSummary, 'count'> & { count?: number };
        active?: boolean;
    } = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- getTagHref returns a resolved URL -->
<a
    class="tag-link"
    class:active
    href={getTagHref(tag.slug)}
    aria-current={active ? 'page' : undefined}
>
    {tag.label}
    {#if tag.count !== undefined}
        <span class="text-faint-foreground">({tag.count})</span>
    {/if}
</a>

<!-- eslint-enable svelte/no-navigation-without-resolve -->