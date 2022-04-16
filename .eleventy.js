const Image = require("@11ty/eleventy-img");
const mdContainer = require("markdown-it-container");
const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const externalLinks = require("@aloskutov/eleventy-plugin-external-links");
const workbox = require("workbox-build");
const htmlParser = require("node-html-parser");
const path = require("path");
const slugify = require("slugify");

async function imageShortcode({
  src,
  alt,
  class_ = "rounded-sm mx-auto",
  sizes = "(min-width: 30em) 33vw, 100vw",
  lazy = true,
}) {
  let metadata = await Image(src, {
    widths: [200, 400, 600],
    formats: ["webp", "avif", "jpeg"],
    outputDir: "./public/images",
    urlPath: "/images",
    filenameFormat: function (id, src, width, format, options) {
      return `${slugify(
        path.basename(src, path.extname(src))
      )}-${id}-${width}.${format}`;
    },
  });

  let imageAttributes = {
    alt,
    sizes,
    class: class_,
    ...(lazy ? { loading: "lazy", decoding: "async" } : {}),
  };

  let high = metadata.jpeg[metadata.jpeg.length - 1];

  return `<div><a href="${high.url}">${Image.generateHTML(
    metadata,
    imageAttributes
  )}</a><p class="text-xs italic text-center -mt-4">${alt}</p></div>`;
}

const strava = (activity, embed) =>
  `<div class="flex justify-center"><iframe loading="lazy" title="strava activity" class="w-full max-w-sm h-96" frameborder='0' allowtransparency='true' scrolling='no' src='https://www.strava.com/activities/${activity}/embed/${embed}'></iframe></div>`;

module.exports = (config) => {
  config.addPassthroughCopy({ "src/static/*": "/" });

  config.addNunjucksAsyncShortcode("image", imageShortcode);
  config.addLiquidShortcode("image", imageShortcode);
  config.addJavaScriptFunction("image", imageShortcode);

  config.addNunjucksShortcode("strava", strava);
  config.addLiquidShortcode("strava", strava);
  config.addJavaScriptFunction("strava", strava);
  config.addShortcode("barChart", require("./shortcodes/bar-chart.js"));

  config.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  const related = require("eleventy-plugin-related").related({
    serializer: ({ data: { title, excerpt, tags } }) => [
      [title, excerpt].join(" "),
      (tags || []).join(" "),
    ],
    weights: [1, 1],
  });

  config.addFilter("relatedPosts", function (doc, docs) {
    return related(doc, docs).filter(({ relative }) => relative > 0.1);
  });

  config.addTransform("htmlmin", (content, outputPath) => {
    if (outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        useShortDoctype: true,
      });
    }

    return content;
  });

  config.addFilter("simplifyCodeHighlightingForRSS", function (value) {
    const prefix = "language-";
    const root = htmlParser.parse(value.replace(/  /g, "&nbsp;&nbsp;"));

    root.querySelectorAll("pre").forEach((el) => {
      const language = [...el.classList.values()].filter((c) =>
        c.startsWith(prefix)
      )[0];

      el.innerHTML = `<code class="${language}">${el.innerText
        .replace(/<\/*(span|code).*?>/g, "")
        .replace(/<br>/g, "&#13;&#10;")}</code>`;
    });

    return root.toString();
  });

  config.addFilter("limit", function (arr, limit) {
    return arr.slice(0, limit);
  });

  const markdownIt = new require("markdown-it")({
    typographer: true,
    linkify: true,
    html: true,
  });

  markdownIt.use(mdContainer, "note");
  markdownIt.use(mdContainer, "tldr");
  
  // https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json
  markdownIt.use(require("markdown-it-emoji"))
  markdownIt.use(require("markdown-it-anchor"))

  config.setLibrary("md", markdownIt);

  config.addPlugin(require("eleventy-plugin-nesting-toc"), {
    tags: ["h2", "h3", "h4"],
  });

  config.addPlugin(require("@11ty/eleventy-plugin-syntaxhighlight"));
  config.addPlugin(require("@11ty/eleventy-plugin-rss"));
  config.addPlugin(require("eleventy-plugin-time-to-read"));
  config.addPlugin(externalLinks, {
    url: "https://justin.poehnelt.com",
    target: "_self",
  });

  config.addFilter("dateDisplay", require("./filters/date-display.js"));

  config.setBrowserSyncConfig({
    files: ["public/**/*"],
    open: true,
  });

  config.setDataDeepMerge(true);

  config.addCollection("postsWithoutDrafts", (collection) =>
    [...collection.getFilteredByGlob("src/posts/*.md")].filter(
      (post) => !post.data.draft
    )
  );

  config.addCollection("postsTaggedRun", (collection) =>
    [...collection.getFilteredByGlob("src/posts/*.md")].filter(
      (post) => !post.data.draft && post.data.tags.includes("run")
    )
  );

  config.addCollection("postsTaggedCode", (collection) =>
    [...collection.getFilteredByGlob("src/posts/*.md")].filter(
      (post) => !post.data.draft && post.data.tags.includes("code")
    )
  );

  config.addWatchTarget("./public/assets/*");
  config.addWatchTarget("./shortcodes/*");

  config.on("eleventy.after", async () => {
    const options = {
      cacheId: "sw",
      skipWaiting: true,
      clientsClaim: true,
      swDest: `public/sw.js`,
      globDirectory: "public",
      globPatterns: [
        "**/*.{html,css,js,mjs,map,jpg,png,gif,webp,ico,svg,woff2,woff,eot,ttf,otf,ttc,json}",
      ],
      runtimeCaching: [
        {
          urlPattern:
            /^.*\.(html|jpg|png|gif|webp|ico|svg|woff2|woff|eot|ttf|otf|ttc|json)$/,
          handler: `StaleWhileRevalidate`,
        },
      ],
    };

    await workbox.generateSW(options);
  });

  return {
    markdownTemplateEngine: "njk",
    pathPrefix: require("./src/_data/site.json").baseUrl,
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
  };
};
