import { resolve } from '$app/paths';

export const title = 'Your Blog';
export const name = 'Your Name';
export const description = 'A blog powered by SvelteKit, Typst, and Tyquire.';
export const year = new Date().getFullYear();
export const pages: { name: string; href: string }[] = [
    { name: 'Posts', href: resolve(`/posts`) },
    { name: 'Tags', href: resolve(`/tags`) },
    { name: 'About', href: resolve(`/about`) },
];
export const socials: { name: string; href: string }[] = [
    { name: 'GitHub', href: 'https://github.com/chinzhening/tyquire' },
    { name: 'Mail', href: 'mailto:your-email@example.com' }
];
