import { BASE_URL, PUBLIC_IMAGES_PREFIX } from "$lib/constants";
import { getMetadataFromMatter } from "./posts.shared";

import { error } from "@sveltejs/kit";
import type { Element } from "hast";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import { render } from "svelte/server";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import { getPostContent } from "./posts";
import matter from "gray-matter";

const CONTENT_BASE_PATH = "/src/content/posts";

// Eager load only metadata for fast listings
const postsMetadata: Record<string, any> = import.meta.glob(
  "/src/content/posts/*.md",
  {
    eager: true,
    import: "metadata",
  },
);

export const getPostMetadata = (id: string) => {
  const filePath = `${CONTENT_BASE_PATH}/${id}.md`;
  const metadata = postsMetadata[filePath];

  if (!metadata) {
    throw error(404, `Post not found: ${id}`);
  }

  return getMetadataFromMatter(id, metadata);
};

export function getPostsMetadata() {
  const metadata = Object.entries(postsMetadata)
    .map(([filePath, data]) => {
      const id = filePath.split("/").pop()?.replace(/\.md$/, "");
      if (!id) throw new Error("Could not extract post ID from path: " + filePath);
      return getMetadataFromMatter(id, data);
    })
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return metadata;
}

export function getAllTags() {
  const posts = getPostsMetadata();
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagSet.add(tag);
    });
  });

  return Array.from(tagSet).sort();
}

export function getTagsWithCounts() {
  const posts = getPostsMetadata();
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .filter(({ count }) => count >= 3)
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.tag.localeCompare(b.tag);
    });
}



// Lazy load raw content for TOC extraction
const postsRaw = import.meta.glob("/src/content/posts/*.md", {
  query: "?raw",
  import: "default",
});

export async function getPostMarkdown(id: string): Promise<string> {
  const { body } = render(await getPostContent(id), {});

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
    const { content } = matter(raw);

    const toc: TocItem[] = [];

    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(() => (tree) => {
        visit(tree, "element", (node: Element) => {
          if (["h2", "h3"].includes(node.tagName) && node.properties?.id) {
            toc.push({
              id: String(node.properties.id),
              text: toString(node),
              depth: parseInt(node.tagName.substring(1)),
            });
          }
        });
      });

    await processor.run(processor.parse(content));

    return toc;
  } catch (e) {
    console.error(`Error generating TOC for ${id}:`, e);
    // Return empty TOC to allow build to continue
    return [];
  }
}
