import { getPosts } from '$lib/posts';
import { escapeXml, getSiteUrl } from '$lib/seo';

export const prerender = true;

export function GET() {
    const paths = [
        '/',
        '/about',
        '/posts',
        '/tags',
        ...getPosts().map((post) => `/posts/${post.slug}`)
    ];
    const urls = paths
        .map((path) => `  <url>\n    <loc>${escapeXml(getSiteUrl(path))}</loc>\n  </url>`)
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
