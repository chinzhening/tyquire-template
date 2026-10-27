import { getPosts } from '$lib/posts';

export async function load() {
    return {
        posts: getPosts()
    };
}
