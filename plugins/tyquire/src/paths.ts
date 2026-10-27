const EXTENDED_LENGTH_PREFIX = /^\\\\\?\\/;

export function normalizePath(path: string): string {
    return path.replace(EXTENDED_LENGTH_PREFIX, '').replace(/\\/g, '/');
}

export function filterWatchableDeps(deps: string[], root: string): string[] {
    return deps
        .map(normalizePath)
        .filter((p) => p !== '<stdin>' && !p.endsWith('/<stdin>'))
        .filter((p) => p.startsWith(root));
}
