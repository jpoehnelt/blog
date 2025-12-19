import * as v from "valibot";
import type { Component } from "svelte";
import { BASE_URL, POSTS_PREFIX } from "$lib/constants";
import { error } from "@sveltejs/kit";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { render } from "svelte/server";
import rehypeParse from "rehype-parse";
import rehypeRemoveComments from "rehype-remove-comments";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";

import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const CONTENT_BASE_PATH = "/src/content/posts";

// Eager load only metadata for fast listings
export const postsMetadata: Record<string, any> = import.meta.glob(
  "/src/content/posts/*.md",
  {
    eager: true,
    import: "metadata",
  },
);

// Lazy load full post content on-demand
const posts = import.meta.glob("/src/content/posts/*.md");

// Lazy load raw content for TOC extraction
const postsRaw = import.meta.glob("/src/content/posts/*.md", {
  query: "?raw",
  import: "default",
});

export const getPostContent = async (id: string): Promise<Component> => {
  const filePath = `${CONTENT_BASE_PATH}/${id}.md`;
  const postLoader = posts[filePath];

  if (!postLoader) {
    throw error(404, `Not found: ${id}`);
  }

  const post = (await postLoader()) as {
    default: any;
    metadata: Record<string, unknown>;
  };

  return post.default;
};

export const getPostMetadata = (id: string) => {
  const filePath = `${CONTENT_BASE_PATH}/${id}.md`;
  const metadata = postsMetadata[filePath];
  return getMetadataFromMatter(id, metadata);
};

export const postMetadataSchema = v.object({
  id: v.pipe(v.string(), v.trim()),
  title: v.pipe(v.string(), v.trim()),
  description: v.pipe(v.string(), v.trim()),
  pubDate: v.pipe(
    v.string(),
    v.transform((i) => new Date(i)),
    v.date(),
  ),
  lastMod: v.optional(
    v.pipe(
      v.string(),
      v.transform((i) => new Date(i)),
      v.date(),
    ),
  ),
  tags: v.array(v.string()),
  tweet: v.optional(v.pipe(v.string(), v.trim())),
  syndicate: v.optional(v.boolean(), false),
});

export function getMetadataFromMatter(
  id: string,
  data: {
    [key: string]: unknown;
  },
) {
  const post = v.parse(postMetadataSchema, {
    id,
    ...data,
  });

  const canonicalURL = new URL(`${POSTS_PREFIX}/${id}/`, BASE_URL).toString();
  const relativeURL = `/${POSTS_PREFIX}/${id}/`;
  const markdownURL = `/${POSTS_PREFIX}/${id}.md`;

  return {
    ...post,
    canonicalURL,
    relativeURL,
    markdownURL,
  };
}

export type Post = ReturnType<typeof getMetadataFromMatter>;

export function getPostsMetadata() {
  const metadata = Object.entries(postsMetadata)
    .map(([filePath, data]) => {
      const id = filePath.split("/").pop()?.replace(/\.md$/, "") as string;

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

export async function getPostMarkdown(id: string): Promise<string> {
  const { body } = render(await getPostContent(id), {});
  const metadata = getPostMetadata(id);

  // Convert HTML back to Markdown using unified pipeline
  return String(
    await unified()
      .use(rehypeParse)
      .use(rehypeRemoveComments)
      .use(() => (tree) => {
        visit(tree, "element", (node: any) => {
          ["href", "src", "poster"].forEach((attr) => {
            if (node.properties?.[attr]?.startsWith("/")) {
              node.properties[attr] = new URL(
                node.properties[attr],
                BASE_URL,
              ).toString();
            }
          });
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
