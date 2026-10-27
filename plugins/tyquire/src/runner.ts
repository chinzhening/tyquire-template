import { spawn } from 'child_process';
import { dirname } from 'path';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { readFile, unlink } from 'fs/promises';

import { readMetadata, type MetadataResult } from './metadata.ts';

interface RunnerOptions {
    fontPaths?: string[];
}

function fontArgs(fontPaths: string[] = []): string[] {
    return fontPaths.flatMap((p) => ['--font-path', p]);
}

function runTypst(args: string[], cwd: string, input?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn('typst', args, { cwd });

        if (input !== undefined) {
            child.stdin.write(input);
        }
        child.stdin.end();

        const chunks: Buffer[] = [];
        child.stdout?.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });
        child.stderr?.on('data', (data: Buffer) => {
            console.error(`[tyquire] ${data.toString().trim()}`);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`typst exited with code ${code}`));
                return;
            }

            resolve(Buffer.concat(chunks).toString('utf8'));
        });

        child.on('error', reject);
    });
}

export async function compile(
    source: string,
    id: string,
    opts: RunnerOptions = {}
): Promise<{ html: string; deps: string[] }> {
    const depsPath = join(tmpdir(), `typst-deps-${randomUUID()}.json`);

    const html = await runTypst(
        [
            'compile',
            '--features',
            'html',
            '--format',
            'html',
            ...fontArgs(opts.fontPaths),
            '--deps',
            depsPath,
            '--deps-format',
            'json',
            '-',
            '-'
        ],
        dirname(id),
        source
    );

    const raw = await readFile(depsPath, 'utf8');
    await unlink(depsPath);

    const { inputs } = JSON.parse(raw) as { inputs: string[] };

    return { html, deps: inputs };
}

export function query<M>(id: string, opts: RunnerOptions = {}): Promise<MetadataResult<M>> {
    return runTypst(
        [
            'eval',
            'query(<metadata>)',
            '--features',
            'html',
            '--in',
            id,
            ...fontArgs(opts.fontPaths)
        ],
        dirname(id)
    ).then((raw) => readMetadata<M>(raw, id));
}
