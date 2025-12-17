import * as v from "valibot";
import type { Component } from "svelte";
import { BASE_URL, POSTS_PREFIX } from "$lib/constants";
import { error } from "@sveltejs/kit";

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
  tags: v.pipe(
    v.string(),
    v.regex(
      /^(?:[A-Za-z0-9._~\s-]|%[0-9A-Fa-f]{2})+(?:,(?:[A-Za-z0-9._~\s-]|%[0-9A-Fa-f]{2})+)*$/,
      "Must be comma-separated tag segments.",
    ),
    v.transform((value) => value.split(",")),
  ),
  tweet: v.optional(v.pipe(v.string(), v.trim())),
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
