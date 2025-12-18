import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { mdsvex, escapeSvelte } from "mdsvex";
import { codeToHtml } from "shiki";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import remarkInlineLinks from "remark-inline-links";

const theme = "github-dark";

const config = {
  trailingSlash: "always",
  extensions: [".svelte", ".md", ".mdx"],
  preprocess: [
    vitePreprocess(),
    enhancedImages(),
    mdsvex({
      extensions: [".md", ".mdx"],
      highlight: {
        highlighter: async (code, lang = "text") => {
          const html = escapeSvelte(
            await codeToHtml(code, {
              lang,
              theme,
              transformers: [
                {
                  code(node) {
                    this.addClassToHast(node, `language-${lang}`);
                  },
                },
              ],
            }),
          );
          return `{@html \`${html}\` }`;
        },
      },
      remarkPlugins: [remarkGfm, remarkInlineLinks],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            properties: {
              className: ["link-hover"],
              "aria-label": "Link to section",
            },
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
  compilerOptions: {
    experimental: {
      async: true,
    },
  },
};

export default config;
