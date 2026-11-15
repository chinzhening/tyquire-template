import { resolve } from '$app/paths';

import { siteUrl } from '$lib/config';

export function getSiteUrl(path: string): string {
    const sitePath = resolve(`${path}`.slice(1));

    return siteUrl ? new URL(sitePath, `${siteUrl.replace(/\/+$/, '')}/`).toString() : sitePath;
}

export function escapeXml(value: string): string {
    return value.replace(
        /[<>&'"]/g,
        (character) =>
            ({
                "'": '&apos;',
                '"': '&quot;',
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;'
            })[character] ?? character
    );
}
