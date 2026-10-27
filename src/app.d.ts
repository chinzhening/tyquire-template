/// <reference path="../plugins/tyquire/src/client.d.ts" />

import type { PostMetadata } from '$lib/types';

declare namespace Tyquire {
    interface Metadata extends PostMetadata {}
}

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
