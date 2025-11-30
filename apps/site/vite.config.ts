import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { defineConfig } from "vite";
import sharp from "sharp";

if (process.env.CI) {
  sharp.concurrency(1);
}

export default defineConfig({
  plugins: [tailwindcss(), enhancedImages(), sveltekit()],
});
