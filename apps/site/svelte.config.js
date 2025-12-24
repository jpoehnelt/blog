import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { mdsvex, escapeSvelte } from "mdsvex";
import { codeToHtml } from "shiki";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import remarkInlineLinks from "remark-inline-links";

const theme = "vitesse-light";

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
                    this.addClassToHast(node, `relative`);
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
    csp: {
      mode: "hash",
      directives: {
        "script-src": [
          "self",
          "https://www.googletagmanager.com",
          "https://maps.googleapis.com",
        ],
        "style-src": ["self", "unsafe-inline", "https://fonts.googleapis.com"],
        "img-src": [
          "self",
          "data:",
          "https://*.google.com",
          "https://*.googleapis.com",
          "https://*.gstatic.com",
        ],
        "connect-src": [
          "self",
          "https://*.google-analytics.com",
          "https://*.analytics.google.com",
          "https://*.googletagmanager.com",
          "https://maps.googleapis.com",
        ],
      },
    },
    paths: {
      relative: false,
    },
    adapter: adapter(),
    output: {
      bundleStrategy: "split", // Code-splitting for efficiency
    },
    inlineStyleThreshold: 51200, // Inline critical CSS up to 50KB
  },
  compilerOptions: {
    experimental: {
      async: true,
    },
  },
};

export default config;
