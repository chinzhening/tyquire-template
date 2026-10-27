import type { Component } from 'svelte';

import type { TypstComponentProps } from '$tyquire/svelte/types';

import CodeBlock from './CodeBlock.svelte';
import FigureBlock from './FigureBlock.svelte';
import Callout from './Callout.svelte';

/**
 * Names emitted by `component()` in the Typst prelude, mapped to the components
 * that render them. `code` is the one name the walker reserves. Adding a block
 * type is an entry here plus a component, with no change under `plugins/`.
 */
export const components: Record<string, Component<TypstComponentProps>> = {
    code: CodeBlock,
    figure: FigureBlock,
    callout: Callout
};
