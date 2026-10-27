import { getPosts, getTagSummaries } from '$lib/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    const posts = getPosts();

    return {
        posts,
        tags: getTagSummaries(posts)
    };
};
