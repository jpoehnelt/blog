const related = require("eleventy-plugin-related").related({
  serializer: ({ data: { title, excerpt, tags } }) => [
    [title, excerpt].join(" "),
    (tags || []).join(" "),
  ],
  weights: [1, 1],
});

eleventyConfig.addFilter("relatedPosts", function (doc, docs) {
  return related(doc, docs).filter(({ relative }) => relative > 0.1);
});
