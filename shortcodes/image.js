const Image = require("@11ty/eleventy-img");
const path = require("path");
const slugify = require("slugify");
const sharp = require("sharp");

module.exports = async function imageShortcode({
  src,
  alt,
  class_ = "rounded-sm mx-auto",
}) {
  const sizes = "(min-width: 30em) 33vw, 100vw";

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
  <source type="image/avif" data-srcset="${metadata.webp
    .map(({ srcset }) => srcset)
    .join(", ")}" sizes="${sizes}">
  <source type="image/jpeg" data-srcset="${metadata.webp
    .map(({ srcset }) => srcset)
    .join(", ")}" data-sizes="${sizes}">`;

  return `
  <div>
    <a href="${high.url}">
      <picture>
        ${source}
        <img alt="${alt}" 
            decoding="async" 
            class="blur lazyload ${class_}" 
            src="${placeholder}" 
            width="${high.width}" height="${high.height}">
      </picture>
    </a>
    <p class="text-xs italic text-center -mt-4">${alt}</p>
    </div>`;
};
