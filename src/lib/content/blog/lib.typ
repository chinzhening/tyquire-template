// Shared primitives for HTML components, figures, and post metadata.

#let is-html() = target() == "html"

// Emit a block component marker for the HTML renderer.
#let component(name, body, ..props) = context {
  if is-html() {
    html.elem("div", attrs: (
      "data-typst-node": name,
      "data-typst-props": json.encode(props.named(), pretty: false),
    ), body)
  } else {
    body
  }
}

// Emit an inline component marker for the HTML renderer.
#let inline-component(name, body, ..props) = context {
  if is-html() {
    html.elem("span", attrs: (
      "data-typst-node": name,
      "data-typst-props": json.encode(props.named(), pretty: false),
    ), body)
  } else {
    body
  }
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
#let figure-rules(body) = context {
  if is-html() {
    show figure: it => component("figure", {
      if it.kind == image {
        html.frame[#it.body]
      } else {
        it.body
      }
      if it.caption != none {
        slot("caption-label", [#it.supplement #context it.counter.display(it.numbering).])
        slot("caption", it.caption.body)
      }
    })
    body
  } else {
    body
  }
}

// Build the metadata block consumed by the content pipeline.
#let generate-metadata(
  title,
  desc,
  published,
  publish_date,
  edited_date,
  tags,
) = {
  if edited_date != none and publish_date != none [ #metadata(
    (title: title,
     desc: desc,
     published: published,
     publish_date: publish_date.display(),
     edited_date: edited_date.display(),
     tags: tags
    )
  ) <metadata>]
  else if publish_date != none [ #metadata(
    (title: title,
     desc: desc,
     published: published,
     publish_date: publish_date.display(),
     tags: tags
    )
  ) <metadata>]
  else [ #metadata(
    (title: title,
     desc: desc,
     published: published,
     tags: tags
    )
  ) <metadata>]
}

// Main article wrapper: emits metadata, applies the rules, and renders content.
#let article(
  content,
  title: "Untitled",
  desc: [This is a blog post.],
  published: false,
  publish_date: none,
  edited_date: none,
  tags: (),
) = {
  generate-metadata(
    title,
    desc,
    published,
    publish_date,
    edited_date,
    tags,
  )

  show: figure-rules

  content
}
