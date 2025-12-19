import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { defineConfig } from "vite";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import glob from "fast-glob";
import { BUILD_IMAGES_PREFIX, SOURCE_IMAGES_DIR } from "./src/lib/constants";

if (process.env.CI) {
  sharp.concurrency(1);
}

function copyImages() {
  return {
    name: "copy-images",
    async buildStart(this: any) {
      const imagesDir = path.resolve(SOURCE_IMAGES_DIR);
      const images = await glob("**/*.{png,jpg,jpeg,gif,svg,webp}", {
        cwd: imagesDir,
      });

      await Promise.all(
        images.map(async (image) => {
          const filePath = path.join(imagesDir, image);
          const fileContent = await fs.promises.readFile(filePath);

          this.emitFile({
            type: "asset",
            fileName: `${BUILD_IMAGES_PREFIX}${image}`,
            source: fileContent,
          });
        }),
      );
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), enhancedImages(), sveltekit(), copyImages()],
});
