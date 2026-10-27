import type { CheerioAPI } from 'cheerio';

export interface TyquireOptions {
    fontPaths?: string[];
    htmlTransforms?: ((doc: CheerioAPI) => void)[];
    transforms?: AstTransform[];
}

export type AstTransform = ((
    doc: TypstDocument,
    warn: (message: string) => void
) => void | Promise<void>) & {
    dispose?: () => void;
};

/**
 * The parser's whole vocabulary. A subtree containing no marker stays an
 * `html` string, so prose, MathML and inline SVG never become node objects;
 * `element` appears only on the path from the body down to a marker.
 */
export type TypstNode =
    | { kind: 'html'; html: string }
    | { kind: 'element'; tag: string; attrs: Record<string, string>; children: TypstNode[] }
    | {
          kind: 'component';
          name: string;
          props: Record<string, unknown>;
          slots?: Record<string, TypstNode[]>;
          children: TypstNode[];
      }
    | { kind: 'code'; id: string; lang: string; source: string; highlighted?: string };

/**
 * `M` is the consumer's metadata schema. The package only runs
 * `query(<metadata>)` and hands back whatever Typst serialised.
 */
export interface TypstDocument<M = unknown> {
    metadata: M;
    children: TypstNode[];
}
