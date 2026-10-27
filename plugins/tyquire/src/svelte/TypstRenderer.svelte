<script lang="ts">
    import type { Component } from 'svelte';
    import { DEV } from './dev.ts';
    import Self from './TypstRenderer.svelte';
    import type { TypstNode } from '../types.ts';
    import type { TypstComponentProps } from './types.ts';

    let {
        nodes,
        components = {}
    }: {
        nodes: TypstNode[];
        components?: Record<string, Component<TypstComponentProps>>;
    } = $props();

    $effect(() => {
        if (!DEV) return;
        for (const node of nodes) {
            if (node.kind === 'component' && !components[node.name]) {
                console.warn(`[tyquire] no component registered for "${node.name}"`);
            }
        }
    });
</script>

{#snippet renderNodes(list: TypstNode[])}
    <Self nodes={list} {components} />
{/snippet}

{#snippet none()}{/snippet}

{#each nodes as node, index (node.kind === 'code' ? node.id : index)}
    {#if node.kind === 'html'}
        {@html node.html}
    {:else if node.kind === 'code'}
        <!-- `{@const}` is legacy as of 5.56, but prettier-plugin-svelte cannot
             parse the `{const}` declaration tag that replaces it. -->
        {@const CodeComponent = components.code}
        {#if CodeComponent}
            <CodeComponent props={node} children={none} slots={{}} {renderNodes} />
        {/if}
    {:else if node.kind === 'element'}
        {#if node.children.length === 0}
            <svelte:element this={node.tag} {...node.attrs} />
        {:else}
            <svelte:element this={node.tag} {...node.attrs}>
                <Self nodes={node.children} {components} />
            </svelte:element>
        {/if}
    {:else}
        {@const Registered = components[node.name]}
        {#snippet nodeChildren()}
            <Self nodes={node.children} {components} />
        {/snippet}
        {#if Registered}
            <Registered
                props={node.props}
                children={nodeChildren}
                slots={node.slots ?? {}}
                {renderNodes}
            />
        {:else}
            {@render nodeChildren()}
        {/if}
    {/if}
{/each}
