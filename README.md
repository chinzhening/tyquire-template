# Tyquire Template

A static SvelteKit blog starter for writing posts in Typst.

Tyquire is the Vite plugin included in this repository. It compiles Typst
posts to HTML, extracts their metadata, walks the document into typed blocks,
and renders those blocks with Svelte components.

## Requirements

- Node.js 22 or newer.
- Typst 0.15.0 or newer with HTML export support.
- Typst output uses the fonts available to the Typst process. Set
  `TYPST_FONT_PATH` when a custom font directory is needed.

## Getting started

```sh
npm install
npm run dev
```

Add posts as `.typ` files in `src/lib/content/`. A post imports the shared
helpers and declares its metadata with `#show: article.with(...)`.

```typst
#import "blog/lib.typ": *
#import "blog/theme.typ": *

#show: theme
#show: article.with(
  title: "My first post",
  desc: [A short description.],
  published: true,
  publish_date: datetime(year: 2026, month: 1, day: 1),
  tags: ("example",),
)

Write the post here.
```

## Commands

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the development server       |
| `npm run build`   | Build the static site              |
| `npm run preview` | Preview the production build       |
| `npm run check`   | Run Svelte and Tyquire type checks |
| `npm run lint`    | Check formatting and lint rules    |
| `npm run format`  | Format project files               |

## Project structure

- `src/lib/content/` - Typst posts and shared Typst helpers.
- `src/lib/components/article/` - Svelte components for article blocks.
- `src/lib/posts.ts` - Post loading, sorting, and tag helpers.
- `src/routes/posts/` - Post archive and article routes.
- `src/routes/tags/` - Query-based tag filtering.
- `plugins/tyquire/` - The Tyquire Vite plugin and Svelte renderer.
- `vite.config.ts` - Tyquire and Shiki integration.
- `svelte.config.js` - SvelteKit adapter and the `$tyquire` alias.

## v0.1 feature plan

The first release is intentionally focused on a static Typst blog:

- Static SvelteKit output through `adapter-static`.
- Typst-to-Svelte compilation through the included Tyquire plugin.
- Typed post metadata and published-post filtering.
- Post archive and individual post pages.
- Previous and next post navigation.
- Query-based tags at `/tags?tag=example`.
- Syntax-highlighted code blocks.
- MathML and Typst figure rendering.
- Labelled callouts and custom article blocks.
- Responsive light and dark themes.
- Generic static-host deployment documentation.
- A small, documented validation layer for serialized metadata query output.

The following are outside the v0.1 core and can be added by template users:

- Projects and portfolio pages.
- Search.
- Comments and reactions.
- Analytics.
- CMS integrations.
- Server-side features.
- Multiple deployment adapters.
- Pagination and related-post recommendations.

## Static deployment

The site is built as static files in `build/` and can be deployed to any
static host. Set `BASE_PATH` when deploying below a domain root, then run:

```sh
npm run build
```

The generated `build/` directory is the deployment artifact.

### GitHub Pages

This repository includes a GitHub Actions workflow that publishes the built
blog to GitHub Pages whenever `main` is updated. In the repository settings,
open **Pages** and set **Source** to **GitHub Actions**.

For a project site, the workflow automatically builds with the repository
name as the base path:

```text
https://username.github.io/repository-name/
```

For a user or organization site whose repository is named
`username.github.io`, the base path is empty. For a custom domain on a project
site, add a repository variable named `PAGES_CUSTOM_DOMAIN` with the value
`true`; this makes the workflow use an empty base path. To override the
default project-site path for another hosting arrangement, set
`PAGES_BASE_PATH` to the required path instead.

The workflow installs Node.js 22 and Typst 0.15 before running `npm ci` and
`npm run build`. The uploaded Pages artifact is the generated `build/`
directory.

## License and customization

Replace the placeholder values, including the repository and contact links, in
`src/lib/config.ts`. Then update the site copy and customize the theme and
article styles for your site.
