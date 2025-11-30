import * as v from "valibot";

import { BASE_URL, POSTS_PREFIX } from "./constants";

export const CONTENT_BASE_PATH = "/src/content/posts";

// Eager load only metadata for fast listings
export const postsMetadata: Record<string, any> = import.meta.glob(
  "/src/content/posts/*.md",
  {
    eager: true,
    import: "metadata",
  },
);

// Lazy load full post content on-demand
export const posts = import.meta.glob("/src/content/posts/*.md");

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
  const canonicalURL = new URL(
    `${POSTS_PREFIX}/${post.id}/`,
    BASE_URL,
  ).toString();
  const relativeURL = `/${POSTS_PREFIX}/${post.id}/`;

  return { ...post, canonicalURL, relativeURL };
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
