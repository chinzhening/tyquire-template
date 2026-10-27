#import "blog/lib.typ": *
#import "blog/theme.typ": *
#import "blog/colors.typ": muted-colors
#import "@preview/cetz:0.5.3": canvas, draw, tree
#import "@preview/fletcher:0.5.8" as fletcher: diagram, edge, node

#show: theme
#show: article.with(
  title: "Callouts, Figures, and Diagrams",
  desc: [A short guide to the visual building blocks available in a Tyquire post.],
  published: true,
  publish_date: datetime(year: 2026, month: 10, day: 27),
  tags: ("typst", "diagrams", "tyquire"),
)

#outline()

= Introduction
Use this post as a starting point for documenting a visual idea. Begin with a
short explanation, add a callout for context, then use a figure to present a
diagram with a caption.

= Callouts
Callouts are useful for a note, warning, or short aside that should not
interrupt the main argument.

#callout[
  Keep callouts short. Put the main explanation in the surrounding paragraphs
  and use the callout for supporting information.
]

Replace the example above with the detail your reader needs to remember.

= Figures
Wrap visual content in `#figure` when it needs a caption or a reference point.
The figure content can be an image, a drawing, or a diagram produced in Typst.

#figure(
  caption: [A caption should explain what the reader is looking at. This is a an Cetz drawing of an expression tree, featured on the #link("https://typst.app/universe/package/cetz/")[Cetz page].],
)[
  #canvas({
    import draw: *
    let encircle(i) = {
      std.box(baseline: 2pt, std.circle(stroke: .5pt + muted-colors.dark-gray, radius: .5em, std.move(dx: -.35em, dy: -.45em, text(fill: muted-colors.dark-gray)[#i])))
    }

    set-style(content: (padding: 0.5em), stroke: .5pt + muted-colors.dark-gray, fill: muted-colors.dark-gray)
    tree.tree(
      (text(fill: muted-colors.dark-gray)[Expression #encircle($5$)], (
          text(fill: muted-colors.dark-gray)[Expression #encircle($3$)],
          (text(fill: muted-colors.dark-gray)[Expression #encircle($1$)], text(fill: muted-colors.dark-gray)[Int(1)]),
          text(fill: muted-colors.dark-gray)[Plus],
          (text(fill: muted-colors.dark-gray)[Expression #encircle($2$)], text(fill: muted-colors.dark-gray)[Int(2)]),
        ),
        text(fill: muted-colors.dark-gray)[`Lt`],
        (text(fill: muted-colors.dark-gray)[Expression #encircle($4$)], text(fill: muted-colors.dark-gray)[Int(4)]),
      ))
  })
]

= Diagrams
The Fletcher package provides a compact way to describe connected diagrams.
Keep the nodes labelled and let the surrounding text explain the relationship
between them.

#figure(
  caption: [Single source, multiple targets.],
)[
  #let fileblob(pos, label, tint: muted-colors.white, w: 25mm, ..args) = node(
    pos,
    align(center, text(size: 0.75em, fill: white, label)),
    width: w,
    fill: tint.darken(60%),
    stroke: 1pt + tint.darken(20%),
    corner-radius: 5pt,
    ..args,
  )

  #diagram(
    spacing: 10pt,
    edge-stroke: 1pt,
    mark-scale: 70%,
    fileblob((0, 0), "*.typ source", w: 22mm, tint: muted-colors.cyan, name: <src>),
    fileblob((1, -1.4), "tinymist preview", w: 18mm, tint: muted-colors.gray, name: <tinymist>),
    fileblob((1, 1.4), "HTML export", w: 18mm, tint: muted-colors.green, name: <html>),
    fileblob((1, 0), "PDF/SVG export", w: 18mm, tint: muted-colors.gray, name: <pdf>),
    edge(<src>, <tinymist>, "-|>", stroke: muted-colors.dark-gray),
    edge(<src>, <html>, "-|>", stroke: muted-colors.dark-gray),
    edge(<src>, <pdf>, "-|>", stroke: muted-colors.dark-gray),
    fileblob((2.3, 1.4), "IR AST", w: 18mm, tint: muted-colors.yellow, name: <pipe>),
    edge(<html>, <pipe>, "-|>", stroke: muted-colors.dark-gray),
    fileblob((4, 1.4), "Svelte", w: 18mm, tint: muted-colors.red, name: <svelte>),
    edge(<pipe>, <svelte>, "-|>", stroke: muted-colors.dark-gray),
  )
]

Describe the diagram after the figure. Explain what each stage does, what
information moves between stages, and where a reader should focus.


#callout(label: "Important")[
  WARNING: `typst` diagrams do not support SVG dark mode adaption yet. So pick your colors wisely.
]

= Closing checklist
- Introduce the idea before showing the visual.
- Use a callout for supporting context, not the main argument.
- Give every figure a useful caption.
- Keep diagrams small enough to read, or let wide figures scroll.