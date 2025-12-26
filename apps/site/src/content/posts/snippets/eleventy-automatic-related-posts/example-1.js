eleventyConfig.addFilter(
  "related",
  require("eleventy-plugin-related").related({
    serializer: (doc) => [doc.title, doc.description ?? "", doc.text ?? ""],
    weights: [10, 1, 3],
  }),
);
