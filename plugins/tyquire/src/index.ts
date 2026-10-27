import type { Plugin } from 'vite';
import { load } from 'cheerio';

import { compile, query } from './runner.ts';
import { annotateStretchyMathFrames, walkDocument } from './parse.ts';
import { wrapBlockMath } from './math.ts';
import { filterWatchableDeps } from './paths.ts';
import { shikiHighlight } from './transforms/highlight.ts';
import type { AstTransform, TypstDocument, TyquireOptions } from './types.ts';

export { shikiHighlight } from './transforms/highlight.ts';
export type { ShikiHighlightOptions } from './transforms/highlight.ts';
export type * from './types.ts';

export default function tyquire(options: TyquireOptions = {}): Plugin {
    const htmlTransforms = options.htmlTransforms ?? [annotateStretchyMathFrames, wrapBlockMath];
    const transforms: AstTransform[] = options.transforms ?? [shikiHighlight()];
    const fontPaths = options.fontPaths ?? [];

    let root = '';
    return {
        name: 'tyquire',
        enforce: 'pre',

        configResolved(config) {
            root = config.root;
        },

        transform: {
            filter: { id: /\.typ$/ },
            async handler(code, id) {
                const source = String(code);
                const warn = this.warn.bind(this);

                const [{ html, deps }, { metadata, count }] = await Promise.all([
                    compile(source, id, { fontPaths }),
                    query(id, { fontPaths })
                ]);

                // Add all watchable dependencies to the Vite watcher so that
                // changes to them will trigger a rebuild.
                filterWatchableDeps(deps, root).forEach((dep) => this.addWatchFile(dep));

                if (count > 1) {
                    warn(`tyquire: ${count} <metadata> found in ${id}, using the first`);
                }

                const $ = load(html);
                for (const t of htmlTransforms) t($);

                const document: TypstDocument = {
                    metadata,
                    children: walkDocument($, { warn, fileId: id })
                };

                for (const t of transforms) await t(document, warn);

                return (
                    `export const metadata = ${JSON.stringify(document.metadata)};\n` +
                    `export default ${JSON.stringify(document.children)};`
                );
            }
        },
        hotUpdate({ modules }) {
            return modules;
        },
        buildEnd() {
            for (const t of transforms) t.dispose?.();
        }
    };
}
