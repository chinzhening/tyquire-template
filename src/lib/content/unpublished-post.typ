#import "blog/lib.typ": *
#import "blog/theme.typ": *

#show: theme
#show: article.with(
  title: "Unpublished Post",
  desc: [This should not be visible and should not crash the build.],
  tags: ("test", "typst", "typescript", "dev"),
)
