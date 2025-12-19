import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { defineConfig } from "vite";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import glob from "fast-glob";

if (process.env.CI) {
  sharp.concurrency(1);
}

const copyImagesKey = "copy-images";

function copyImages() {
  return {
    name: copyImagesKey,
    async buildStart(this: any) {
      // images are in src/lib/images
      const imagesDir = path.resolve("src/lib/images");
      const images = await glob("**/*.{png,jpg,jpeg,gif,svg,webp}", {
        cwd: imagesDir,
      });

      for (const image of images) {
        const filePath = path.join(imagesDir, image);
        const fileContent = await fs.promises.readFile(filePath);

        this.emitFile({
          type: "asset",
          fileName: `images/${image}`,
          source: fileContent,
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), enhancedImages(), sveltekit(), copyImages()],
});
