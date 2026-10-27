#import "blog/lib.typ": *
#import "blog/theme.typ": *

#show: theme
#show: article.with(
  title: "Getting Started with Tyquire",
  desc: [],
  published: true,
  publish_date: datetime(year: 2026, month: 10, day: 27),
  tags: (
    "tyquire", "docs"
  ),
)

#outline()

#show heading.where(level: 1): set heading(numbering: "Step 1.")

= Setup
Open the #link("https://github.com/chinzhening/tyquire-template")[Tyquire
template] on GitHub and select *Fork*. This creates a copy you can customize
without changing the original repository.

Clone your fork and move into the project directory:
```shell
git clone https://github.com/your-name/tyquire-template.git
cd tyquire-template
```

Install #link("https://nodejs.org/en/download")[Node.js 22 or newer] and
#link("https://typst.app/open-source/")[Typst 0.15.0 or newer]. Tyquire uses
Node.js for the SvelteKit development server and Typst to compile posts.

Install the JavaScript dependencies:
```shell
npm install
```

= Start the development server
Start SvelteKit in development mode:
```shell
npm run dev
```

Open the local URL printed in your terminal, usually
`http://localhost:5173`. The server watches the project and rebuilds the site
when source files change. Stop it with `Ctrl+C`.

= Make a change
Posts live in `src/lib/content/` and use the `.typ` extension. 
Open `src/lib/content/getting-started.typ` and try fixing the _typo_ on this page, try fixing the typo on this page.

Save the Typst source and the development server rebuilds the site.

Refresh the browser to see the change reflected. Your typo is now fixed!

= Writing a post
Every `.typ` file under `content/` is a post. Post metadata is 
declared within the `#show: article.with(...)` rule at the
top of the file.

```typst
#import "blog/lib.typ": *
#show: article.with(
  title: "Getting Started with Tyquire",
  desc: [],
  published: true,
  publish_date: datetime(year: 2026, month: 10, day: 27),
  edited_date: none,          // optional
  tags: ("tyquire", "docs"),
)

= Heading 1
#lorem(50)
```
The post url (slug) is derived from the filename. For example, `getting-started.typ` becomes
`/posts/getting-started`.

Currently, Tyquire only supports Typst authoring for posts. The
rest of the site content is written in HTML.


= Components
Components let a Typst post describe content while Svelte decides how that
content is rendered. The Typst helpers emit a named component marker and
optional properties or slots into the HTML export. The Tyquire renderer walks
the resulting tree and passes each node to the registered Svelte component.

The template currently includes three article components:
- `code` renders fenced code blocks with Shiki highlighting and a copy button.
- `figure` renders figures, captions, and scrollable frames for wide diagrams.
- `callout` renders a labelled aside for supporting information.

Figures are registered automatically by the shared Typst helpers. A callout
can be written in a post with:
```typst
#callout[
  This text is rendered by `Callout.svelte` in HTML.
]
```

Pass a label when the callout needs a different meaning:
```typst
#callout(label: "Warning")[
  Check the configuration before continuing.
]
```

The registry lives in `src/lib/components/article/components.ts`. To add a
component, define a Svelte component with the `TypstComponentProps` interface,
register it under the same name, and emit that name from a Typst helper with
`component("name", ...)`. The renderer supplies the component's child content,
properties, slots, and a `renderNodes` helper for nested content.

Components are only used for HTML output. The Typst helpers can provide a
separate PDF representation when needed, so the writing source does not have
to contain target-specific HTML markup.

The benefit of this approach is the option to define components
that require interactivity or dynamic behavior within the article,
e.g. code block copy buttons, figure zooming, or animations.

However at the same time, using Typst native components is also
possible.

#hrule()

For figures, callouts, and diagrams, see this #link("diagrams")[post] for examples.