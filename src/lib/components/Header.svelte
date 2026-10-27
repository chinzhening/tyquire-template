<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import * as config from '$lib/config';
    import { pages } from '$lib/config';
    import { resolve } from '$app/paths';

    type Theme = 'light' | 'dark';
    let theme = $state<Theme>('light');

    onMount(() => {
        const savedTheme = localStorage.getItem('theme');
        theme =
            savedTheme === 'light' || savedTheme === 'dark'
                ? savedTheme
                : window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light';

        document.documentElement.setAttribute('color-scheme', theme);
    });

    function toggleTheme() {
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('color-scheme', theme);
        localStorage.setItem('theme', theme);
    }
</script>

<header
    class="
    container mx-auto
    max-w-[80ch]
    px-6
    mt-6
    pt-6
    "
>
    <div class="flex gap-4 justify-between">
        <a class="font-monospace text-md pt-2 pb-1" href={resolve('/')} aria-label="Home"
            ><span>{config.name}:blog</span></a
        >
        <nav class="items-center flex font-monospace lowercase text-dim-foreground">
            <!-- Block form, not disable-next-line: the href sits mid-tag and the
                 directive can only target the line after it. -->
            <!-- eslint-disable svelte/no-navigation-without-resolve -- already resolved, in config.ts:8-10 -->
            {#each pages as navPage (navPage.name)}
                <a
                    class="
                        px-2
                        justify-self-center
                        text-xs
                        uppercase tracking-widest
                        "
                    href={navPage.href}
                    aria-current={page.url.pathname === navPage.href ? 'page' : undefined}
                    >{navPage.name}</a
                >
            {/each}
            <!-- eslint-enable svelte/no-navigation-without-resolve -->

            <!-- Dark mode toggle -->
            <button
                class="theme-toggle"
                onclick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                aria-pressed={theme === 'dark'}
            ></button>
        </nav>
    </div>
    <!-- styled divider bottom -->
    <div class="h-px w-full bg-border"></div>
</header>

<style>
    a {
        border-bottom: none;
    }

    :global(:root[color-scheme='dark'] .theme-toggle:before) {
        transform: rotate(180deg);
    }

    .theme-toggle {
        cursor: pointer;
        background: 0 0;
        border: 0;
        place-items: center;
        width: 22px;
        height: 22px;
        margin: -4px -4px -2px 0;
        padding: 0;
        display: grid;
    }
    .theme-toggle:hover:before {
        border-color: var(--text-1);
        background: var(--text-1);
    }
    .theme-toggle:before {
        content: '';
        border: 1.5px solid var(--text-4);
        background: transparent;
        border-radius: 50%;
        width: 12px;
        height: 12px;
        transition:
            transform 0.3s,
            border-color 0.15s,
            background-color 0.15s;
    }
</style>
