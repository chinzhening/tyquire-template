import type { CheerioAPI } from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import type { TypstNode } from './types.ts';
import { CODE_FENCE_SELECTOR } from './constants.ts';
import { isRecord } from './metadata.ts';
import { normalizeStretchy } from './math.ts';

const COMPONENT_SELECTOR = '[data-typst-node], [data-typst-slot]';

/**
 * Keep the `pre >` combinator. Inline `#raw(lang:)` emits a bare
 * `<code data-lang>` with no `<pre>`, so a plain `code` selector would make
 * every paragraph containing inline code fail the base case and explode into
 * `element` nodes.
 */
const MARKER_SELECTOR = `${COMPONENT_SELECTOR}, ${CODE_FENCE_SELECTOR}`;

export interface WalkOptions {
    warn: (message: string) => void;
    fileId: string;
}

interface WalkContext extends WalkOptions {
    codeIndex: number;
}

export function annotateStretchyMathFrames($: CheerioAPI) {
    $('math').each((_, el) => {
        normalizeStretchy($, el);
    });
}

export function walkDocument($: CheerioAPI, options: WalkOptions): TypstNode[] {
    return walk($, $('body').contents().toArray(), { ...options, codeIndex: 0 });
}

function isElement(node: AnyNode): node is Element {
    return node.type === 'tag';
}

function isCodeFence($: CheerioAPI, node: Element): boolean {
    return node.tagName === 'pre' && $(node).children('code').length > 0;
}

function hasMarker($: CheerioAPI, node: Element): boolean {
    const $node = $(node);
    return (
        $node.is(COMPONENT_SELECTOR) ||
        isCodeFence($, node) ||
        $node.find(MARKER_SELECTOR).length > 0
    );
}

function walk($: CheerioAPI, nodes: AnyNode[], ctx: WalkContext): TypstNode[] {
    const out: TypstNode[] = [];

    for (const node of nodes) {
        if (node.type === 'text') {
            const html = $.html(node) ?? '';
            if (html.trim()) {
                out.push({ kind: 'html', html });
            }
            continue;
        }

        if (!isElement(node)) {
            continue;
        }

        // The base case, and the common one: no marker below, so the whole
        // subtree stays one opaque string. This is what keeps MathML and the
        // inline SVGs whole instead of walking them node by node.
        if (!hasMarker($, node)) {
            out.push({ kind: 'html', html: $.html(node) ?? '' });
            continue;
        }

        if (isCodeFence($, node)) {
            const code = createCodeNode($, node, ctx);
            if (code) {
                out.push(code);
            }
            continue;
        }

        if (node.attribs['data-typst-node'] !== undefined) {
            out.push(createComponentNode($, node, ctx));
            continue;
        }

        // Only reachable when a wrapper contains a marker, so `element` nodes
        // appear on the path to an exposed node and nowhere else.
        out.push({
            kind: 'element',
            tag: node.tagName,
            attrs: { ...node.attribs },
            children: walk($, node.children, ctx)
        });
    }

    return out;
}

function createComponentNode($: CheerioAPI, node: Element, ctx: WalkContext): TypstNode {
    const name = node.attribs['data-typst-node'] ?? '';
    const props = parseProps(node.attribs['data-typst-props'], name, ctx);

    // Typst puts a referenced label on the marker element as a plain `id`, and
    // `component` has no `attrs`. Without this, `<a href="#pipeline">` dangles.
    const id = node.attribs['id'];
    if (id && props.id === undefined) {
        props.id = id;
    }

    const slots: Record<string, TypstNode[]> = {};
    const children: TypstNode[] = [];

    // Walked child by child rather than partitioned and walked in two passes,
    // so `codeIndex` follows document order even when a slot holds a fence.
    for (const child of node.children) {
        if (isElement(child)) {
            const slotName = child.attribs['data-typst-slot'];
            if (slotName !== undefined) {
                slots[slotName] = walk($, child.children, ctx);
                continue;
            }
        }
        children.push(...walk($, [child], ctx));
    }

    return {
        kind: 'component',
        name,
        props,
        children,
        ...(Object.keys(slots).length > 0 ? { slots } : {})
    };
}

function parseProps(
    raw: string | undefined,
    name: string,
    ctx: WalkContext
): Record<string, unknown> {
    if (!raw) {
        return {};
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (isRecord(parsed)) {
            return parsed;
        }
        ctx.warn(`tyquire: props on "${name}" in ${ctx.fileId} are not an object`);
    } catch {
        ctx.warn(`tyquire: could not parse props on "${name}" in ${ctx.fileId}`);
    }

    return {};
}

function createCodeNode($: CheerioAPI, node: Element, ctx: WalkContext): TypstNode | null {
    const codeElement = $(node).children('code').first();
    const source = codeElement.text();
    const id = `codeblock-${ctx.codeIndex}`;

    if (!source) {
        ctx.warn(`tyquire: empty <code> block "${id}" in ${ctx.fileId}`);
        return null;
    }

    ctx.codeIndex += 1;

    const rawLang = codeElement.attr('data-lang') ?? '';

    return {
        kind: 'code',
        id,
        lang: rawLang || 'plaintext',
        source
    };
}
