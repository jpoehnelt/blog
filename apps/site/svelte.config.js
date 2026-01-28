import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { mdsvex, escapeSvelte } from "mdsvex";
import { codeToHtml } from "shiki";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import remarkInlineLinks from "remark-inline-links";
import remarkSnippet from "@jpoehnelt/remark-snippet";

/** @type {string} */
const theme = "vitesse-light";

/** @type {import('@sveltejs/kit').Config} */
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
      remarkPlugins: [remarkGfm, remarkInlineLinks, remarkSnippet],
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
    alias: {
      $data: "./src/data",
    },
    adapter: adapter(),
    output: {
      bundleStrategy: "split", // Code-splitting for efficiency
    },
    inlineStyleThreshold: 51200, // Inline critical CSS up to 50KB
    typescript: {
      config: (config) => {
        const snippetsDir = "../src/content/posts/snippets";
        console.log("Applying exclude for snippets", snippetsDir);
        config.exclude = [...(config.exclude || []), snippetsDir];
        return config;
      },
    },
  },
  compilerOptions: {
    experimental: {
      async: true,
    },
  },
};

export default config;
