import matter from "@jpoehnelt/matter";
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

import { generateSnippets } from "./src/lib/server/snippet-generator";

function snippetPlugin() {
  return {
    name: "snippet-plugin",
    async buildStart() {
      await generateSnippets();
    },
    async handleHotUpdate({ file }: any) {
      if (file.includes("src/content/posts") && file.endsWith(".md")) {
        await generateSnippets();
      }
    },
  };
}

function tagsPlugin() {
  function normalizedTags(tags: string[]) {
    return tags.map((tag: string) => tag.toLowerCase().replace(" ", "").trim());
  }

  const LIKELY_CODE_TAGS = normalizedTags([
    "apps script",
    "google workspace",
    "javascript",
    "typescript",
    "python",
    "oauth",
  ]);

  return {
    name: "tags-plugin",
    apply: "build" as const,
    async buildStart() {
      const posts = await glob("src/content/posts/*.md");
      for (const post of posts) {
        const fileContent = await fs.promises.readFile(post, "utf-8");
        const { data, content } = matter.parse(fileContent);

        let modified = false;

        if (!data.tags) {
          data.tags = [];
        }

        const normalizeTags = normalizedTags(data.tags);
        for (const tag of LIKELY_CODE_TAGS) {
          if (!normalizeTags.includes("code") && normalizeTags.includes(tag)) {
            data.tags.push("code");
            modified = true;
            break;
          }
        }

        if (modified) {
          await fs.promises.writeFile(post, matter.stringify(content, data));
          console.log(`Updated tags for ${post}`);
        }
      }
    },
  };
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

import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    tagsPlugin(),
    tailwindcss(),
    enhancedImages(),
    sveltekit(),
    copyImages(),
    snippetPlugin(),
    process.env.ANALYZE ? visualizer({
      emitFile: true,
      filename: "stats.html",
    }) : undefined,
  ].filter(Boolean),
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.message.includes("dynamically imported")) {
          throw new Error(warning.message);
        }
        warn(warning);
      },
    },
  },
});
