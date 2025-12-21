import { BASE_URL, PUBLIC_IMAGES_PREFIX } from "$lib/constants";
import { error } from "@sveltejs/kit";
import type { Element } from "hast";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import { render } from "svelte/server";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { getPostContent, getPostMetadata } from "./posts";

const CONTENT_BASE_PATH = "/src/content/posts";

// Lazy load raw content for TOC extraction
const postsRaw = import.meta.glob("/src/content/posts/*.md", {
  query: "?raw",
  import: "default",
});

export async function getPostMarkdown(id: string): Promise<string> {
  const { body } = render(await getPostContent(id), {});
  const metadata = getPostMetadata(id);

  // Convert HTML back to Markdown using unified pipeline
  return String(
    await unified()
      .use(rehypeParse)
      .use(rehypeRemoveComments)
      .use(() => (tree) => {
        visit(tree, "element", (node: Element) => {
          if (node.properties?.dataOriginalSrc) {
            const originalSrc = String(node.properties.dataOriginalSrc);

            // Check if it's a relative path (not absolute and not http/https)
            // and assume it corresponds to an image in the images directory.
            // We previously checked for SOURCE_IMAGES_DIR, but now we support direct filenames.
            const isRelative =
              !originalSrc.startsWith("/") && !originalSrc.startsWith("http");

            if (isRelative) {
              // Strip potential "./" prefix if present
              const imagePath = originalSrc.replace(/^\.\//, "");

              const newUrl = new URL(
                `${PUBLIC_IMAGES_PREFIX}${imagePath}`,
                BASE_URL,
              ).toString();

              if (node.tagName === "img") {
                node.properties.src = newUrl;
              }
              if (node.tagName === "a") {
                node.properties.href = newUrl;
              }
            }
          } else {
            ["href", "src", "poster"].forEach((attr) => {
              const value = node.properties?.[attr];
              if (typeof value === "string" && value.startsWith("/")) {
                node.properties[attr] = new URL(value, BASE_URL).toString();
              }
            });
          }
        });
      })
      .use(rehypeRemark)
      .use(remarkGfm)
      .use(remarkStringify)
      .process(body),
  );
}

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

export async function getPostToc(id: string): Promise<TocItem[]> {
  const filePath = `${CONTENT_BASE_PATH}/${id}.md`;
  const postLoader = postsRaw[filePath];

  if (!postLoader) {
    throw error(404, `Not found: ${id}`);
  }

  try {
    const raw = (await postLoader()) as string;

    const toc: TocItem[] = [];

    await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeStringify)
      .use(() => (tree) => {
        visit(tree, "element", (node: any) => {
          if (["h2", "h3"].includes(node.tagName) && node.properties?.id) {
            toc.push({
              id: node.properties.id,
              text: getHastText(node),
              depth: parseInt(node.tagName.substring(1)),
            });
          }
        });
      })
      .process(raw);

    return toc;
  } catch (e) {
    console.error(`Error generating TOC for ${id}:`, e);
    // Return empty TOC to allow build to continue
    return [];
  }
}

// Helper to extract text from HAST node
function getHastText(node: any): string {
  if (node.type === "text") return node.value;
  if (node.children) {
    return node.children.map(getHastText).join("");
  }
  return "";
}
