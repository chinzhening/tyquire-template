import { getPosts, getTagSummaries } from '#lib/posts.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    const posts = getPosts();

    return {
        posts,
        tags: getTagSummaries(posts)
    };
};
