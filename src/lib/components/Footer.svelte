<script lang="ts">
    import * as config from '$lib/config';
</script>

<!-- Site footer: renders copyright and platform links. -->
<footer
    class="
    container mx-auto
    px-6 py-20
    max-w-[80ch]
    border-t border-border
    "
>
    <div class="flex flex-col items-center gap-2 text-center font-monospace">
        <span class="text-xs text-faint-foreground uppercase tracking-widest">
            {config.name} &copy; {config.year} &dotsquare;
            <a href="https://github.com/chinzhening/tyquire-template">Tyquire</a>
        </span>
        <nav
            class="
            flex gap-3
            justify-center
            flex-wrap
            uppercase
            text-foreground
            tracking-widest
            text-xs"
        >
            {#each config.socials as social (social.name)}
                <a class="hover-link" rel="external" href={social.href}>{social.name}</a>
            {/each}
        </nav>
    </div>
</footer>
