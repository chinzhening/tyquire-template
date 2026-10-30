#import "blog/lib.typ": *
#import "blog/theme.typ": *

#show: theme
#show: article.with(
  title: "A Small Tour of Math in Typst",
  desc: [A compact reference for writing inline math, equations, and symbols in a Tyquire post.],
  publish_date: datetime(year: 2026, month: 10, day: 27),
  tags: ("math", "typst"),
)

#outline()

It is highly encouraged to use a math font for proper rendering `mathml` on the web.
This can be set in `src/lib/css/math.css`.

= Inline math
Typst puts inline mathematics between dollar signs. The expression
$f(x) = x^2 + 2 x + 1$ stays in the surrounding sentence, so it is useful for
short definitions and references to a variable.

Use subscripts and superscripts directly on a symbol:
$a_1$, $a_2$, and $a_n$ describe members of a sequence, while $x^2$ and
$x^(n + 1)$ describe powers. Braces make the extent of a subscript or
superscript explicit when it contains more than one symbol.

= Display equations
Put a longer expression on its own line when it deserves room to breathe:

```typst
$ p_t(x) = (p_0 * phi.alt_t)(x)
  = integral p_0(y) phi.alt_t(x - y) dif y,
  quad phi.alt_t(z) = 1 / sqrt(2 pi t) exp(-z^2 / (2t)) $
```
$ p_t(x) = (p_0 * phi.alt_t)(x)
  = integral p_0(y) phi.alt_t(x - y) dif y,
  quad phi.alt_t(z) = 1 / sqrt(2 pi t) exp(-z^2 / (2t)) $

For the SDE $d X_t = sqrt(2) d W_t$, this Gaussian convolution describes the
evolved density. Its differential entropy is

```typst
$ H(p_t) = - integral p_t(x) log p_t(x) dif x $
```
$ H(p_t) = - integral p_t(x) log p_t(x) dif x $

The convolution smooths the density and, under suitable regularity
assumptions, the entropy increases along the diffusion. The source stays close
to the notation, and Typst exports the expression as MathML for the web output.

= Aligned equations
Aligned equations are not supported at the moment. For a multi-step derivation,
write each equation separately and keep the explanation in normal prose around
the equations.

= Symbols and sets
Common symbols are available as named math symbols:

- $alpha$, $beta$, and $theta$ are Greek letters.
- $in$, $subset.eq$, and $forall$ describe membership and sets.
- $sum_(i=1)^n i$ describes a finite sum.
- $arrow.r$, $arrow.l$, and $arrow.l.r$ describe directed relationships.

For example, the definition of a mean can be written as:

$ "mean"(x) = 1 / n sum_(i=1)^n x_i $

#callout[
  Prefer a short explanation next to an equation. A reader should not have to
  decode the source markup to understand what the notation means.
]

= Math on the web
The page uses the same Typst source for the article body and its MathML output.
That keeps equations sharp at every screen size and lets the browser adapt
their layout to the surrounding text.

When adding a new equation, check both themes. Math should remain readable
without relying on a color that only works on a light background.

= Closing checklist
- Use inline math for short expressions.
- Put substantial equations on their own line.
- Align multi-step derivations at a shared operator.
- Explain symbols in prose.
- Check the rendered result in both light and dark themes.
