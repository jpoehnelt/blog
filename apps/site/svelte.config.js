import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { mdsvex } from "mdsvex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { transformerCopyButton } from "@rehype-pretty/transformers";
import remarkGfm from "remark-gfm";
import remarkInlineLinks from "remark-inline-links";


const config = {
  trailingSlash: "always",
  extensions: [".svelte", ".md", ".mdx"],
  preprocess: [
    vitePreprocess(),
    enhancedImages(),
    mdsvex({
      extensions: [".md", ".mdx"],
      remarkPlugins: [remarkGfm, remarkInlineLinks],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            properties: { className: ["link-hover"], "aria-label": "Link to section" },
          },
        ],
        [
          rehypePrettyCode,
          {
            theme: {
              light: "github-light",
              dark: "github-dark",
            },
            transformers: [
              transformerCopyButton({
                visibility: "hover",
                feedbackDuration: 3_000,
              }),
            ],
          },
        ],
      ],
    }),
  ],
  kit: {
    paths: {
      relative: false,
    },
    adapter: adapter(),
    output: {
      bundleStrategy: "split", // Code-splitting for efficiency
    },
    inlineStyleThreshold: 8192, // Inline critical CSS up to 8KB
  },
};

export default config;
