#import "colors.typ": muted-colors
#import "lib.typ": component, is-html

#let fonts = (
  mono: "DejaVu Sans Mono",
)

#let web-root-size = 12pt
#let font-size = 0.75 * web-root-size
#let rem(value) = value * font-size

// Render a labelled callout inside the article body. HTML gets the
// component marker; PDF gets its own boxed styling.
#let callout(content, label: "Note") = component(
  "callout", content, label: label,
  paged: body => {
    block(
      inset: 2em,
      stroke: 0.5pt + muted-colors.dark-gray,
      fill: muted-colors.yellow,
      {
        block(text(font: fonts.mono, fill: muted-colors.dark-gray, upper(label)))
        body
      }
    )
  }
)

// Single show-rule entry point for the theme. Every PDF-only presentational
// rule lives inside here, so a post applies the theme once via `#show:
// theme` and a new rule added later needs no change in any post.
#let theme(body) = context {
  // Match the web article's 0.75rem body and 1.75rem list padding.
  let margin = 4 * rem(1)
  let character-width = measure(text(font: fonts.mono, size: font-size, "0")).width
  set page(width: 80 * character-width + 2 * margin, margin: margin)
  set text(font: fonts.mono, size: font-size)
  set enum(indent: rem(1.75))
  set list(indent: rem(1.75))

  show raw.where(block: true): it => if is-html() { it } else {
      block(width: 100%, inset: 1em, radius: 0.25em,
      fill: muted-colors.yellow, stroke: 0.5pt + muted-colors.gray, it)
  }
  show raw.where(block: false): it => if is-html() { it } else {
    box(inset: (x: 0.25em, y: 0.1em), radius: 0.25em,
      fill: muted-colors.yellow, stroke: 0.5pt + muted-colors.gray, it)
  }
  show outline.entry: it => if is-html() { it } else {
    block(inset: (left: 2em), width: 100%,
      link(it.element.location(), it.indented(it.prefix(), it.body())))
  }
  show figure.caption: it => if is-html() { it } else [
    #strong[#it.supplement #context it.counter.display(it.numbering)#it.separator]#it.body
  ]

  body
}