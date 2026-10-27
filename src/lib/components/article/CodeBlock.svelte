<script lang="ts">
    import '$lib/css/shiki.css';

    import type { TypstComponentProps } from '$tyquire/svelte/types';

    let { props }: TypstComponentProps = $props();

    // A `code` node's fields arrive through `props`, since every entry in the
    // components map shares one signature.
    let language = $derived(props.lang as string);
    let source = $derived(props.source as string);
    let highlightedHtml = $derived(props.highlighted as string);

    let copied = $state(false);
    let resetTimer: number | undefined;

    $effect(() => {
        return () => {
            if (resetTimer) window.clearTimeout(resetTimer);
        };
    });

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(source);
        } catch (err) {
            console.error('Failed to copy code to clipboard:', err);
            return;
        }

        copied = true;

        if (resetTimer) {
            window.clearTimeout(resetTimer);
        }

        resetTimer = window.setTimeout(() => {
            copied = false;
            resetTimer = undefined;
        }, 2400);
    }
</script>

<!-- Styled from article.css under `.typst`, like Callout and FigureBlock. -->
<div
    role="group"
    aria-label={`${language} code`}
    class="code-block relative"
>
    <div class="px-4 pt-1 flex justify-between">
        <div class="flex items-center text-xs font-monospace uppercase tracking-widest">
            {language}
        </div>
        <button
            class="copy-button"
            class:copied
            type="button"
            aria-label="Copy to clipboard"
            onclick={copyToClipboard}
        >
            <div class="relative">
                <div class="flex h-5 w-5 items-center justify-center">
                    {#if copied}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            class="shrink-0"
                        >
                            <path
                                d="M15.188 5.11a.5.5 0 0 1 .752.626l-.056.084-7.5 9a.5.5 0 0 1-.738.033l-3.5-3.5-.064-.078a.501.501 0 0 1 .693-.693l.078.064 3.113 3.113 7.15-8.58z"
                            ></path>
                        </svg>
                    {:else}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            class="shrink-0"
                        >
                            <path
                                d="M12.5 3A1.5 1.5 0 0 1 14 4.5V6h1.5A1.5 1.5 0 0 1 17 7.5v8a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 15.5V14H4.5A1.5 1.5 0 0 1 3 12.5v-8A1.5 1.5 0 0 1 4.5 3zm1.5 9.5a1.5 1.5 0 0 1-1.5 1.5H7v1.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5H14zM4.5 4a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5z"
                            ></path>
                        </svg>
                    {/if}
                </div>
            </div>
        </button>
        <!-- Present from first render so the announcement is not missed. -->
        <div role="status" class="sr-only">{copied ? 'Copied to clipboard' : ''}</div>
    </div>
    <!-- Scrolls here; the injected <pre> no longer does. Focusable per WCAG 2.1.1.
         Shiki also emits its own tabindex on the <pre> - see plugin #15 -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
        class="pl-4 mb-4 max-h-[800px] overflow-auto focus-visible:outline-[2px_solid_var(--text-1)]"
        tabindex="0"
        role="region"
        aria-label={`${language} source`}
    >
        {@html highlightedHtml}
    </div>
</div>

<style>
    /* ─── Code blocks ──────────────────────────────────────────────────────────────── */
    .code-block {
        margin-block: 1.5rem;
        overflow: hidden;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 0.75rem;
    }

    .copy-button {
        display: inline-flex;
        position: relative;
        isolation: isolate;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        cursor: pointer;
        color: var(--text-1);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .code-block:hover .copy-button,
    .copy-button:focus-visible,
    .copy-button.copied {
        opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
        .copy-button {
            transition: none;
        }
    }

    :global(.code-block pre) {
        border: 0;
        border-radius: 0;
        box-shadow: none;
        outline: none;
    }
</style>
