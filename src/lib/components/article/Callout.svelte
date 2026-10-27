<script lang="ts">
    import type { TypstComponentProps } from '$tyquire/svelte/types';

    let { props, children }: TypstComponentProps = $props();
    let label = $derived((props.label as string | undefined) ?? 'Note');
</script>

<aside class="callout" role="note" aria-label={label}>
    <div class="label" aria-hidden="true">{label}</div>
    {@render children()}
</aside>
