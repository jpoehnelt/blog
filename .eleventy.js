const mdContainer = require("markdown-it-container");
const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const externalLinks = require("@aloskutov/eleventy-plugin-external-links");
const workbox = require("workbox-build");
const htmlParser = require("node-html-parser");

module.exports = (config) => {
  config.addPassthroughCopy({ "src/static/*": "/" });

  config.addAsyncShortcode("image", require("./shortcodes/image"));
  config.addShortcode("strava", require("./shortcodes/strava"));
  config.addShortcode("barChart", require("./shortcodes/bar-chart"));
  config.addShortcode(
    "inlineAd",
    () =>
      `<div><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1251836334060830" crossorigin="anonymous"></script>
<ins 
  class="adsbygoogle" 
  style="display:block;text-align:center;" 
  data-ad-layout="in-article" 
  data-ad-format="fluid" 
  data-ad-client="ca-pub-1251836334060830" 
  data-ad-slot="4574002733"
></ins>
<script> (adsbygoogle = window.adsbygoogle || []).push({});</script></div>`
  );

  config.addShortcode(
    "linkAd",
    () =>
      `<div><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1251836334060830" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
  style="display:block"
  data-matched-content-ui-type="text"
  data-matched-content-rows-num="4"
  data-matched-content-columns-num="1"
  data-ad-format="autorelaxed"
  data-ad-client="ca-pub-1251836334060830"
  data-ad-slot="1370955012"></ins>
<script> (adsbygoogle = window.adsbygoogle || []).push({}); </script></div>`
  );

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
  markdownIt.use(require("markdown-it-emoji"));
  markdownIt.use(require("markdown-it-anchor"));

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
          handler: `CacheFirst`,
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
