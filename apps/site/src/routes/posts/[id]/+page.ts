import { error } from "@sveltejs/kit";

import {
  posts,
  CONTENT_BASE_PATH,
  getPostsMetadata,
  getMetadataFromMatter,
  type Post,
} from "$lib/content/posts";

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const matchPath = `${CONTENT_BASE_PATH}/${params.id}.md`;
  const postLoader = posts[matchPath];

  if (!postLoader) {
    return error(404, `Post not found: ${params.id}`);
  }

  // Dynamically import only this post's content
  const post = (await postLoader()) as {
    default: any;
    metadata: Record<string, unknown>;
  };

  // mdsvex provides metadata as a named export
  const postMetaData = getMetadataFromMatter(params.id, post.metadata || {});

  return {
    PostContent: post.default,
    recommendations: getRecommendations(postMetaData, getPostsMetadata(), 2),
    ...postMetaData,
  };
};

const CATEGORY_TAGS = new Set([
  "Tip",
  "Essay",
  "Showcase",
  "Tutorial",
  "Opinion",
  "Workshop",
  "Guide",
]);

function getRecommendations(
  current: Post,
  allPosts: Post[],
  limit = 6,
): Post[] {
  const currentId = current.id;

  // ignore category tags
  const currentTags = new Set(
    current.tags.filter((t) => !CATEGORY_TAGS.has(t)),
  );

  const scored = allPosts
    .filter((p) => p.id !== currentId)
    .map((p) => {
      const overlap = countOverlap(
        currentTags,
        p.tags.filter((t) => !CATEGORY_TAGS.has(t)),
      );
      return { post: p, overlap };
    });

  scored.sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    const byDate = b.post.pubDate.getTime() - a.post.pubDate.getTime();
    if (byDate !== 0) return byDate;
    return a.post.title.localeCompare(b.post.title);
  });

  return scored.slice(0, limit).map((s) => s.post);
}

function countOverlap(currentTags: Set<string>, otherTags: string[]): number {
  let matches = 0;
  for (const t of otherTags) if (currentTags.has(t)) matches++;
  return matches;
}
