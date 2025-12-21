import {
  getPostMetadata,
  getPostsMetadata,
  type Post,
} from "$lib/content/posts";
import { getPostToc } from "$lib/content/posts.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const postMetaData = getPostMetadata(params.id);
  const toc = await getPostToc(params.id);

  return {
    toc,
    recommendations: getRecommendations(postMetaData, getPostsMetadata(), 4),
    latest: getPostsMetadata()
      .filter((p) => p.id !== params.id)
      .slice(0, 4),
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
