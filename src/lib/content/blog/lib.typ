// Shared primitives for HTML components, figures, and post metadata.

#let is-html() = target() == "html"

#let component-labels = (label("typst-component"), label("typst-inline-component"))

// Emit a block component marker for HTML, with an optional paged fallback.
#let component(name, body, paged: none, ..props) = {
  let node = context {
    if is-html() {
      html.elem("div", attrs: (
        "data-typst-node": name,
        "data-typst-props": json.encode(props.named(), pretty: false),
      ), body)
    } else if paged != none {
      paged(body)
    } else {
      body
    }
  }
  [#node#label("typst-component")]
}

#let is-component(node) = (
  type(node) == content and node.has("label") and node.label in component-labels
)


// Emit an inline component marker for HTML, with an optional paged fallback.
#let inline-component(name, body, paged: none, ..props) = {
  let node = context {
    if is-html() {
      html.elem("span", attrs: (
        "data-typst-node": name,
        "data-typst-props": json.encode(props.named(), pretty: false),
      ), body)
    } else if paged != none {
      paged(body)
    } else {
      body
    }
  }
  [#node#label("typst-inline-component")]
}

// Preserve named child content for components that expose slots.
#let slot(name, body) = context {
  if is-html() {
    html.elem("div", attrs: ("data-typst-slot": name), body)
  } else {
    body
  }
}

// Insert a horizontal rule in either output target.
#let hrule() = context {
  if is-html() {
    html.elem("hr")
  } else {
    line(length: 100%)
  }
}
// Register the figure component and keep captions as named slots.
#let figure-rules(body) = {
  show figure: it => if is-html() {
    component("figure", {
      let e = it.body
      if is-component(e) or (type(e) == content and e.func() == html.elem) {
        e
      } else if it.kind == image {
        html.frame(e)
      } else {
        e
      }
      if it.caption != none {
        slot("caption-label", [#it.supplement #context numbering(
          it.numbering,
          ..counter(figure.where(kind: it.kind)).get(),
        ).])
        slot("caption", it.caption.body)
      }
    })
  } else {
    it
  }
  body
}

// Build the metadata block consumed by the content pipeline.
#let generate-metadata(
  title,
  desc,
  publish_date,
  edited_date,
  tags,
) = {
  assert(publish_date == none or type(publish_date) == datetime)
  assert(edited_date == none or type(edited_date) == datetime)

  if edited_date != none and publish_date != none [#metadata(
    (title: title,
     desc: desc,
     publish_date: publish_date.display(),
     edited_date: edited_date.display(),
     tags: tags
    )
  ) <metadata>]
  else if publish_date != none [ #metadata(
    (title: title,
     desc: desc,
     publish_date: publish_date.display(),
     tags: tags
    )
  ) <metadata>]
  else [ #metadata(
    (title: title,
     desc: desc,
     tags: tags
    )
  ) <metadata>]
}

// Main article wrapper: emits metadata, applies the rules, and renders content.
#let article(
  content,
  title: "Untitled",
  desc: [This is a blog post.],
  publish_date: none,
  edited_date: none,
  tags: (),
) = {
  generate-metadata(
    title,
    desc,
    publish_date,
    edited_date,
    tags,
  )

    show: figure-rules
    content
}
