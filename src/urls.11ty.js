exports.data = {
  eleventyExcludeFromCollections: true,
  permalink: "/urls.txt",
};

exports.render = function (data) {
  return data.collections.all
    .map((post) => `${post.url}`.trim())
    .sort()
    .join("\n");
};
