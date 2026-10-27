import { description, title } from '$lib/config';
import { getPosts } from '$lib/posts';
import { escapeXml, getSiteUrl } from '$lib/seo';

export const prerender = true;

export function GET() {
    const posts = getPosts();
    const items = posts
        .map((post) => {
            const url = getSiteUrl(`/posts/${post.slug}`);
            const publishedAt = new Date(post.publish_date).toUTCString();

            return [
                '    <item>',
                `      <title>${escapeXml(post.title)}</title>`,
                `      <description>${escapeXml(post.desc)}</description>`,
                `      <link>${escapeXml(url)}</link>`,
                `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
                `      <pubDate>${publishedAt}</pubDate>`,
                '    </item>'
            ].join('\n');
        })
        .join('\n');

    const feedUrl = getSiteUrl('/rss.xml');
    const content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        `    <title>${escapeXml(title)}</title>`,
        `    <description>${escapeXml(description)}</description>`,
        `    <link>${escapeXml(getSiteUrl('/'))}</link>`,
        `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
        `    <lastBuildDate>${posts.length ? new Date(posts[0].publish_date).toUTCString() : new Date(0).toUTCString()}</lastBuildDate>`,
        items,
        '  </channel>',
        '</rss>',
        ''
    ].join('\n');

    return new Response(content, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8'
        }
    });
}
