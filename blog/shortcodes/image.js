const Image = require("@11ty/eleventy-img");
const path = require("path");
const slugify = require("slugify");
const sharp = require("sharp");
const fs = require("fs");
const htmlmin = require("html-minifier");

async function imageShortcode({ src, alt, class_ = "rounded-sm mx-auto" }) {
  if (src.endsWith(".gif")) {
    await fs.promises.mkdir("./public/images", { recursive: true });
    await fs.promises.copyFile(src, `./public/images/${path.basename(src)}`);

    const url = `/images/${path.basename(src)}`;
    return `<div><a href="${url}"><img alt="${alt}" decoding="async" class="${class_}" src="${url}"></a><p class="text-xs italic text-center -mt-4">${alt}</p></div>`;
  }

  const sizes = "(min-width: 30em) 33vw, 100vw";

  let metadata = await Image(src, {
    widths: [200, 400, 600, 800, 1000],
    formats: ["webp", "avif", "jpeg"],
    outputDir: "./public/images",
    urlPath: "/images",
    filenameFormat: function (id, src, width, format, options) {
      return `${slugify(
        path.basename(src, path.extname(src)),
      )}-${id}-${width}.${format}`;
    },
  });

  const high = metadata.jpeg[metadata.jpeg.length - 1];
  const low = metadata.jpeg[0];
  const buffer = await sharp(low.outputPath)
    .jpeg({ quality: 40 })
    .blur(15)
    .toBuffer();
  const placeholder = `data:image/jpeg;base64,${buffer.toString("base64")}`;

  const source = `
  <source type="image/webp" data-srcset="${metadata.webp
    .map(({ srcset }) => srcset)
    .join(", ")}" sizes="${sizes}">
  <source type="image/avif" data-srcset="${metadata.avif
    .map(({ srcset }) => srcset)
    .join(", ")}" sizes="${sizes}">
  <source type="image/jpeg" data-srcset="${metadata.jpeg
    .map(({ srcset }) => srcset)
    .join(", ")}" sizes="${sizes}">`;

  return `
  <div class="flex flex-col gap-2">
    <a href="${high.url}">
      <picture>
        ${source}
        <img alt="${alt}" 
            decoding="async" 
            class="blur-img lazyload ${class_}" 
            src="${placeholder}" 
            width="${high.width}" height="${high.height}">
      </picture>
    </a>
    <p class="text-xs italic text-center mt-0">${alt}</p>
    </div>`;
}

module.exports = async (...args) =>
  htmlmin.minify(await imageShortcode(...args), {
    collapseWhitespace: true,
    removeComments: true,
    useShortDoctype: true,
  });
