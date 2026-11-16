import { resolve } from '$app/paths';
import { getPosts } from '#lib/posts.ts';
import { escapeXml } from '#lib/seo.ts';

export const prerender = true;

export function GET() {
    const paths = [
        '/',
        '/about',
        '/posts',
        '/tags',
        ...getPosts().map((post) => resolve('/posts/[slug]', { slug: post.slug }))
    ];
    const urls = paths
        .map((path) => `  <url>\n    <loc>${escapeXml(path)}</loc>\n  </url>`)
        .join('\n');

    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            `${urls}\n` +
            `</urlset>\n`,
        {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8'
            }
        }
    );
}
