#import "blog/lib.typ": *
#import "blog/theme.typ": *

#show: article.with(
  title: "Building a Custom Article Component",
  desc: [A step-by-step guide to connecting a Typst marker with a Svelte component.],
  publish_date: datetime(year: 2026, month: 10, day: 28),
  tags: ("typst", "svelte", "components"),
)
#show: theme

#outline()

= Why use a custom component?
Typst is a pleasant place to describe the content of an article. Svelte is a
better place to implement browser behavior such as animation, resize handling,
and keyboard interaction.

Tyquire connects the two. A Typst helper emits a named marker, the renderer
turns that marker into a component node, and the component registry selects the
Svelte component that should display it.

The shared helpers provide two marker types:

- `component(name, body, paged: none, ..props)` emits a block component.
- `inline-component(name, body, paged: none, ..props)` emits an inline component.

Named child regions can be marked with `slot(name, body)`. In HTML, slots are
preserved as `data-typst-slot` markers; in paged output, they render as the
body content.

= Step 1: define the Typst marker
Start with a helper that emits a component named `animation`. The helper can
carry small configuration values as named properties:

```typst
#let animation(content, size: 10) = component(
  "animation",
  content,
  paged: body => block(width: 100%, inset: 5em, stroke: red + 1pt, body),
  size: size,
)
```

#let animation(content, size: 10) = component(
  "animation",
  content,
  paged: body => block(width: 100%, inset: 5em, stroke: red + 1pt, body),
  size: size,
)

In a post, the component reads like ordinary Typst content:

```typst
#animation(size: 20)[
  A graph with 20 nodes.
]
```

The body becomes child content. The `size` property becomes component data.
The helper's first two arguments are the marker name and body; additional
named arguments are encoded as component properties. Keep the marker small:
the Svelte implementation should own the browser behavior, not the article
source.

#let size = 20
#figure(
  caption: [Dijkstra's algorithm explores a #{size}-node graph from a starting node through the lowest-cost path.],
  animation(size: size)[Dijkstra Animation],
)


= Step 2: register the Svelte component
Create `Animation.svelte` next to the other article components and register it
under the exact same name:

```
import Animation from './Animation.svelte';

export const components = {
  code: CodeBlock,
  figure: FigureBlock,
  callout: Callout,
  animation: Animation,
};
```

The registry is the boundary between the content language and the UI layer.
Tyquire supplies the component's properties, child content, slots, and a
`renderNodes` helper for nested Typst output. Register every name emitted by a
Typst helper under the same name.

= Step 3: build the canvas animation
The animation component can use a canvas to show Dijkstra's algorithm on a
13-node graph. Generate stable pseudo-random positions, connect the nodes with
weighted edges, keep the current frontier in component state, and advance one
shortest-path step at a time.

A useful sequence is:

1. Draw thirteen nodes and their connecting weighted edges.
2. Select the starting node and add it to the frontier.
3. Highlight the next node with the smallest known distance.
4. Relax its neighbors and redraw the distances.
5. Continue until the target is reached.

The canvas is presentation only. Keep the algorithm state in a small,
deterministic data structure so the animation can be paused, redrawn, or
restarted without changing the post.

= Step 4: play once when visible
Use an `IntersectionObserver` so the animation begins when the component first
enters the viewport. Disconnect the observer after the first intersection and
guard the animation with a `hasPlayed` flag.

That behavior matters for a static blog: the page should not spend work
animating content the reader has not reached, and scrolling back should not
restart the demonstration unexpectedly.

The component should also respect reduced-motion preferences. In that case,
draw the completed path immediately or provide a still frame with the same
information.

#callout(label: "Design note")[
  A custom component should still have a useful fallback. If JavaScript is
  unavailable, the surrounding explanation and a static image or text summary
  should communicate the algorithm's result.
]

= Step 5: provide a paged fallback
The optional `paged` argument defines the representation used when the post
is compiled to PDF. Without it, `component()` renders its body unchanged
outside HTML:

```typst
#let animation(content, size: 13) = component(
  "animation",
  content,
  size: size,
  paged: body => block(
    stroke: 0.5pt + luma(60%),
    inset: 1em,
    [Dijkstra animation: #body],
  ),
)
```

This keeps an interactive component readable when JavaScript is unavailable.
Use `inline-component()` instead when the component must remain inline:

```typst
#let badge(content, kind: "note") = inline-component(
  "badge",
  content,
  kind: kind,
)
```

= Step 6: keep the interface small
The Typst side only needs the values that affect the article:

```typst
#animation(
  size: 13,
  start: 0,
  target: 12,
)[
  Dijkstra's algorithm explores the lowest-cost frontier first.
]
```

The Svelte side can own colors, timing, canvas dimensions, and responsive
layout. This keeps the writing source readable and makes the component easier
to replace later.

= Step 7: use named slots
Use `slot(name, body)` when a component needs named child regions:

```typst
#let media-card(content, caption: none) = component(
  "media-card",
  content,
  caption: caption,
)

#media-card(caption: [A short caption])[
  #slot("media", [The main visual])
]
```

The Svelte component receives those named regions through `slots`, alongside
`props` and the default `children`.

= Closing checklist
- Emit a stable component name from Typst.
- Register the same name in the Svelte component registry.
- Use `component()` for block markers and `inline-component()` for inline markers.
- Provide a `paged` fallback for interactive or HTML-specific components.
- Use `slot()` for named child regions.
- Keep algorithm state separate from drawing state.
- Start the animation only when it enters the viewport.
- Play once and honor reduced-motion preferences.
- Provide a useful non-animated fallback.
