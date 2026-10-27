export function formatDate(date: string): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options).replace(/\//g, '-');
}

export function padZero(num: number): string {
    return num.toString().padStart(2, '0');
}

export function toKebabCase(str: string): string {
    return str
        .trim()
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}
