import matter from "gray-matter";
import * as v from "valibot";

import { BASE_URL, POSTS_PREFIX } from "./constants";

export const CONTENT_BASE_PATH = "/src/content/posts";

export const posts: Record<string, string> = import.meta.glob(
  "/src/content/posts/*.mdx",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

export const blogPostMetadataSchema = v.object({
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
      /^(?:[A-Za-z0-9._~-]|%[0-9A-Fa-f]{2})+(?:,(?:[A-Za-z0-9._~-]|%[0-9A-Fa-f]{2})+)*$/,
      "Must be comma-separated URL-safe segments.",
    ),
    v.transform((value) => value.split(",")),
  ),
});

export function getMetadataFromMatter(
  id: string,
  data: {
    [key: string]: unknown;
  },
) {
  const post = v.parse(blogPostMetadataSchema, {
    id,
    ...data,
  });
  const canonicalURL = new URL(
    `${POSTS_PREFIX}/${post.id}`,
    BASE_URL,
  ).toString();
  const relativeURL = `/${POSTS_PREFIX}/${post.id}`;

  return { ...post, canonicalURL, relativeURL };
}

export type Post = ReturnType<typeof getMetadataFromMatter>;

export function getPostsMetadata() {
  const metadata = Object.entries(posts)
    .map(([filePath, rawContent]) => {
      const { data } = matter(rawContent);
      const id = filePath
        .split("/")
        .pop()
        ?.replace(/\.mdx$/, "") as string;

      return getMetadataFromMatter(id, data);
    })
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return metadata;
}
