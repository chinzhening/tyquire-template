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
