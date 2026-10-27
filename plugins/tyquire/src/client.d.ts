declare namespace Tyquire {
    interface Metadata {}
}

declare module '*.typ' {
    const children: import('./types.ts').TypstNode[];
    export default children;
    export const metadata: Tyquire.Metadata;
}
