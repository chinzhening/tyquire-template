import { error } from '@sveltejs/kit';

import { getPrevAndNextPostLinks, validatePostMetadata } from '$lib/posts';
import type { PostMetadata } from '$lib/types';
import type { TypstNode } from '$tyquire';

export async function load({ params, parent }) {
    const document = await importPostDocument(params.slug).catch(() => null);
    if (!document) error(404);

    const { metadata, children } = document;
    const { posts } = await parent();
    const { prevPost, nextPost } = getPrevAndNextPostLinks(posts, params.slug);
    return {
        slug: params.slug,
        metadata,
        children,
        prevPost,
        nextPost
    };
}

interface PostDocument {
    metadata: PostMetadata;
    children: TypstNode[];
}

async function importPostDocument(slug: string): Promise<PostDocument> {
    const module = await import(`../../../lib/content/${slug}.typ`);
    return {
        metadata: validatePostMetadata(module.metadata, `src/lib/content/${slug}.typ`),
        children: module.default as TypstNode[]
    };
}
