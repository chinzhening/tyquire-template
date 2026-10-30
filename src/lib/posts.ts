import { resolve } from '$app/paths';

import type { PostMetadata } from '$lib/types';
import { toKebabCase } from '$lib/utils';

export interface PostSummary extends PostMetadata {
    slug: string;
    href: string;
}

export interface TagSummary {
    slug: string;
    label: string;
    count: number;
}

export function validatePostMetadata(value: unknown, fileId: string): PostMetadata {
    if (!isRecord(value)) {
        throw new Error(`Invalid metadata in ${fileId}: expected an object`);
    }

    if (typeof value.title !== 'string' || value.title.trim() === '') {
        throw new Error(`Invalid metadata in ${fileId}: title must be a non-empty string`);
    }
    if (typeof value.desc !== 'string') {
        throw new Error(`Invalid metadata in ${fileId}: desc must be a string`);
    }

    const title = value.title;
    const desc = value.desc;

    const publishDate =
        value.publish_date !== undefined
            ? validateDate(value.publish_date, 'publish_date', fileId)
            : undefined;
    const editedDate =
        value.edited_date !== undefined
            ? validateDate(value.edited_date, 'edited_date', fileId)
            : undefined;

    if (editedDate && publishDate === undefined) {
        throw new Error(
            `Invalid metadata in ${fileId}: edited_date is present but publish_date is missing`
        );
    }

    if (editedDate && publishDate && editedDate.timestamp < publishDate.timestamp) {
        throw new Error(
            `Invalid metadata in ${fileId}: edited_date must not be earlier than publish_date`
        );
    }

    if (!isNonEmptyStringArray(value.tags)) {
        throw new Error(
            `Invalid metadata in ${fileId}: tags must be an array of non-empty strings`
        );
    }

    return {
        title,
        desc,
        ...(publishDate ? { publish_date: publishDate.value } : {}),
        ...(editedDate ? { edited_date: editedDate.value } : {}),
        tags: value.tags
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyStringArray(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.every((item) => typeof item === 'string' && item.trim() !== '')
    );
}

function validateDate(
    value: unknown,
    field: string,
    fileId: string
): { value: string; timestamp: number } {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`Invalid metadata in ${fileId}: ${field} must be a date string`);
    }

    // ISO 8601 date format, with optional milliseconds and timezone.
    const iso8601Regex =
        /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/;

    if (!iso8601Regex.test(value)) {
        throw new Error(
            `Invalid metadata in ${fileId}: ${field}='${value}' must be an ISO 8601 date`
        );
    }

    const timestamp = Date.parse(value);

    if (!Number.isFinite(timestamp)) {
        throw new Error(`Invalid metadata in ${fileId}: ${field} must be a valid date`);
    }

    return { value, timestamp };
}

export function getPosts(): PostSummary[] {
    const modules = import.meta.glob<{ metadata: PostMetadata }>('$lib/content/*.typ', {
        eager: true
    });

    const posts = Object.entries(modules).map(([path, mod]) => {
        const slug = path.split('/').at(-1)!.replace('.typ', '');
        return {
            slug,
            href: resolve(`/posts/${slug}`),
            ...validatePostMetadata(mod.metadata, path)
        };
    });

    type PublishedPost = (typeof posts)[number] & { publish_date: string };

    const publishedPosts = posts.filter(
        (post): post is PublishedPost => typeof post.publish_date === 'string'
    );

    publishedPosts.sort((a, b) => b.publish_date.localeCompare(a.publish_date));

    return publishedPosts;
}

export function getPrevAndNextPostLinks(
    posts: PostSummary[],
    slug: string
): { prevPost: PostSummary | null; nextPost: PostSummary | null } {
    const index = posts.findIndex((post) => post.slug === slug);

    return {
        nextPost: index < posts.length - 1 ? posts[index + 1] : null,
        prevPost: index > 0 ? posts[index - 1] : null
    };
}

export function normalizeTag(tag: string): string {
    return toKebabCase(tag);
}

export function getTagHref(tag: string): string {
    return `${resolve('/tags')}?tag=${encodeURIComponent(normalizeTag(tag))}`;
}

export function getPostsByTag(posts: PostSummary[], tag: string): PostSummary[] {
    const normalizedTag = normalizeTag(tag);
    if (!normalizedTag) {
        return [];
    }

    return posts.filter((post) => post.tags.some((t) => normalizeTag(t) === normalizedTag));
}

export function getTagSummaries(posts: PostSummary[]): TagSummary[] {
    const tagMap = new Map<
        string,
        {
            count: number;
            labels: Map<string, { count: number; firstSeen: number }>;
        }
    >();
    let firstSeen = 0;

    for (const post of posts) {
        const postTags = new Set<string>();

        for (const tag of post.tags) {
            const normalizedTag = normalizeTag(tag);
            if (!normalizedTag || postTags.has(normalizedTag)) {
                continue;
            }
            postTags.add(normalizedTag);

            let summary = tagMap.get(normalizedTag);
            if (!summary) {
                summary = { count: 0, labels: new Map() };
                tagMap.set(normalizedTag, summary);
            }

            summary.count++;

            const label = summary.labels.get(tag);
            if (label) {
                label.count++;
            } else {
                summary.labels.set(tag, { count: 1, firstSeen });
            }
            firstSeen++;
        }
    }

    return [...tagMap.entries()]
        .map(([slug, summary]) => {
            const label = [...summary.labels.entries()].sort(
                ([, a], [, b]) => b.count - a.count || a.firstSeen - b.firstSeen
            )[0][0];

            return { slug, label, count: summary.count };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
}

export function getTagLabel(posts: PostSummary[], tag: string): string | null {
    const normalizedTag = normalizeTag(tag);
    return getTagSummaries(posts).find((summary) => summary.slug === normalizedTag)?.label ?? null;
}
