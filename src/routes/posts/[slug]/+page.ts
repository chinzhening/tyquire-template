import { error } from '@sveltejs/kit';

import { getPrevAndNextPostLinks } from '$lib/posts';
import type { TypstNode } from '$tyquire';

export async function load({ params, parent }) {
    const document = await importPostDocument(params.slug).catch(() => null);
    if (!document) error(404);

    const { children } = document;
    const { posts } = await parent();
    const post = posts.find((post) => post.slug === params.slug) ?? error(404);

    // Construct the metadata object to be returned
    const metadata = {
        title: post.title,
        desc: post.desc,
        publish_date: post.publish_date,
        edited_date: post.edited_date,
        tags: post.tags
    };
    
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
    children: TypstNode[];
}

async function importPostDocument(slug: string): Promise<PostDocument> {
    const module = await import(`../../../lib/content/${slug}.typ`);
    return {
        children: module.default as TypstNode[]
    };
}
