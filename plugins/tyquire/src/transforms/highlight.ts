import { createHighlighter, type Highlighter } from 'shiki';
import type { AstTransform, TypstNode } from '../types.ts';
import { SUPPORTED_LANGS } from '../constants.ts';

export interface ShikiHighlightOptions {
    langs?: readonly string[];
    theme?: string | { light: string; dark: string };
}

function walk(
    nodes: TypstNode[],
    highlighter: Highlighter,
    langs: readonly string[],
    theme: string | { light: string; dark: string },
    warn: (message: string) => void
): void {
    for (const node of nodes) {
        if (node.kind === 'code') {
            const supported = (langs as readonly string[]).includes(node.lang);
            const highlightLang = supported ? node.lang : 'plaintext';

            if (!supported && node.lang !== 'plaintext') {
                warn(
                    `tyquire: unsupported code language "${node.lang}", falling back to plaintext`
                );
            }

            node.highlighted = highlighter.codeToHtml(node.source, {
                lang: highlightLang,
                ...(typeof theme === 'string' ? { theme } : { themes: theme }),
                transformers: [
                    {
                        pre(hast) {
                            // Shiki sets this as the raw HTML attribute name
                            // `tabindex`, not hast's usual camelCase `tabIndex` --
                            // confirmed by inspecting hast.properties directly.
                            delete hast.properties.tabindex;
                        }
                    }
                ]
            });
            continue;
        }

        if (node.kind === 'element') {
            walk(node.children, highlighter, langs, theme, warn);
            continue;
        }

        if (node.kind === 'component') {
            walk(node.children, highlighter, langs, theme, warn);
            if (node.slots) {
                for (const slot of Object.values(node.slots)) {
                    walk(slot, highlighter, langs, theme, warn);
                }
            }
        }
    }
}

export function shikiHighlight(opts: ShikiHighlightOptions = {}): AstTransform {
    const langs = opts.langs ?? SUPPORTED_LANGS;
    const theme = opts.theme ?? { light: 'github-light', dark: 'github-dark' };
    let highlighter: Highlighter | undefined;

    const transform: AstTransform = async (doc, warn) => {
        highlighter ??= await createHighlighter({
            themes: typeof theme === 'string' ? [theme] : [theme.light, theme.dark],
            langs: [...langs]
        });
        walk(doc.children, highlighter, langs, theme, warn);
    };

    transform.dispose = () => {
        highlighter?.dispose();
        highlighter = undefined;
    };

    return transform;
}
