/**
 * Content leaves that carry no `text` field of their own. Without `space` the
 * flattener silently concatenates words: `desc` in first-post has seven.
 */
const LEAF_TEXT: Record<string, string> = {
    space: ' ',
    linebreak: ' ',
    parbreak: ' '
};

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Collapse one serialised Typst content value to a string.
 *
 * Dispatches on shape rather than on `func`, so wrappers Typst grows later
 * flatten with no change here. Only `text`, `body` and `children` are read:
 * `link` also carries a `dest`.
 */
function contentToString(node: unknown): string {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(contentToString).join('');
    if (!isRecord(node)) return '';

    if (typeof node.text === 'string') return node.text;
    if (Array.isArray(node.children)) return node.children.map(contentToString).join('');
    if (node.body !== undefined) return contentToString(node.body);

    const func = typeof node.func === 'string' ? node.func : '';
    // Typst reports whether the quote was double, never whether it opened or
    // closed, so both sides render straight.
    if (func === 'smartquote') return node.double === false ? "'" : '"';

    // Math elements carry neither `body` nor `children`, so an equation in a
    // metadata field flattens away. Recovering it would mean enumerating the
    // math element set, which is what dispatching on shape exists to avoid.
    return LEAF_TEXT[func] ?? '';
}

/**
 * Resolve every content value inside a queried metadata dictionary, leaving
 * numbers, booleans, arrays, and plain strings untouched.
 * Knows nothing about consumer's schema.
 */
export function flattenContent(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(flattenContent);
    if (!isRecord(value)) return value;
    if ('func' in value) return contentToString(value);

    return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, flattenContent(val)])
    );
}

export interface MetadataResult<M> {
    metadata: M;
    /** How many `<metadata>` labels matched. More than one is ambiguous. */
    count: number;
}

/**
 * Validate the shape of `typst eval query(<metadata>)` output before casting it
 * to the consumer's schema. Every throw names the file, since the plugin runs
 * across a glob and the raw errors do not say which post failed.
 */
export function readMetadata<M>(raw: string, fileId: string): MetadataResult<M> {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (cause) {
        throw new Error(`tyquire: could not parse metadata query for ${fileId}`, { cause });
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error(`tyquire: no <metadata> found in ${fileId}`);
    }

    const first: unknown = parsed[0];
    if (!isRecord(first) || !('value' in first)) {
        throw new Error(`tyquire: <metadata> in ${fileId} carries no value`);
    }

    return { metadata: flattenContent(first.value) as M, count: parsed.length };
}
