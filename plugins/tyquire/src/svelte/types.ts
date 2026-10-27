import type { Snippet } from 'svelte';
import type { TypstNode } from '../types.ts';

/**
 * The single signature every entry in the `components` map is called with.
 * Fixed rather than spread, so an author's Typst props can never collide with
 * the renderer's own fields.
 */
export interface TypstComponentProps {
    /** Whatever `component("name", ..., k: v)` encoded, plus `id` when the node carries one. */
    props: Record<string, unknown>;
    /** The node's non-slot children, already walked. */
    children: Snippet;
    /** Named regions, unwalked, keyed by the `slot()` name. Empty object when there are none. */
    slots: Record<string, TypstNode[]>;
    /** Renders a node array. The only way to place a slot, since slot names cannot be snippets. */
    renderNodes: Snippet<[TypstNode[]]>;
}
