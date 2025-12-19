import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import glob from "fast-glob";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { defineConfig } from "vite";
import { PUBLIC_IMAGES_PREFIX, SOURCE_IMAGES_DIR } from "./src/lib/constants";

if (process.env.CI) {
  sharp.concurrency(1);
}

function copyImages() {
  return {
    name: "copy-images",
    apply: "build" as const,
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
            fileName: `${PUBLIC_IMAGES_PREFIX}${image}`,
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
