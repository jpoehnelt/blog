// eleventy.js
const workbox = require("workbox-build");

module.exports = (eleventyConfig) => {
  eleventyConfig.on("eleventy.after", async () => {
    // see https://developer.chrome.com/docs/workbox/reference/workbox-build/#type-GenerateSWOptions
    const options = {
      cacheId: "sw",
      skipWaiting: true,
      clientsClaim: true,
      swDest: `public/sw.js`, // TODO change public to match your dir.output
      globDirectory: "public", // TODO change public to match your dir.output
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
    dir: {
      output: "public", // TODO update this
    },
  };
};
