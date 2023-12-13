exports.data = {
  eleventyExcludeFromCollections: true,
  permalink: "/urls.txt",
};

exports.render = function (data) {
  return data.collections.all
    .map((post) => `${data.site.url.href}${post.url}`.trim())
    .join("\n");
};
