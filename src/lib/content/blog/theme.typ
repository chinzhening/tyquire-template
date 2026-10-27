#import "colors.typ": muted-colors
#import "lib.typ": component, is-html

#let fonts = (
  mono: "DejaVu Sans Mono",
)

// Render a labelled callout inside the article body. HTML gets the
// component marker; PDF gets its own boxed styling.
#let callout(content, label: "Note") = context {
  if is-html() {
    component("callout", content, label: label)
  } else {
    block(
      inset: 2em,
      stroke: 1pt + muted-colors.dark-gray,
      fill: muted-colors.yellow,
      [
      #block(text(
        font: fonts.mono,
        fill: muted-colors.dark-gray,
        upper(label)
        ))
        #content
      ]
    )
  }
}

// Single show-rule entry point for the theme. Every PDF-only presentational
// rule lives inside here, so a post applies the theme once via `#show:
// theme` and a new rule added later needs no change in any post.
#let theme(body) = context {
  if is-html() {
    body
  } else {
    // Keep the readable text measure at roughly 80 monospace characters.
    set page(width: 56em, margin: 6em)
    set text(font: fonts.mono)

    // Keep code blocks and inline code close to the HTML article treatment.
    show raw.where(block: true): it => block(
      width: 100%,
      inset: 1em,
      radius: 0.25em,
      fill: muted-colors.yellow,
      stroke: 1pt + muted-colors.gray,
      it,
    )
    show raw.where(block: false): it => box(
      inset: (x: 0.25em, y: 0.1em),
      radius: 0.25em,
      fill: muted-colors.yellow,
      stroke: 1pt + muted-colors.gray,
      it,
    )

    // Use an indented contents list without leaders or page numbers.
    show outline.entry: it => link(
      it.element.location(),
      it.indented(it.prefix(), it.body()),
    )

    // lib.typ's figure-rules no longer opinionates this.
    show figure.caption: it => [
      #strong[#it.supplement #it.counter.display(it.numbering)#it.separator]#it.body
    ]
    body
  }
}
