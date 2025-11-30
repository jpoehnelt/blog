import { getPostsMetadata } from "$lib/content";

import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async () => {
  const posts = getPostsMetadata();

  // Count posts per tag
  const tagCounts = new Map<string, number>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // Convert to array, filter tags with 3+ posts, and sort by count (descending), then alphabetically
  const tags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .filter(({ count }) => count >= 3)
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.tag.localeCompare(b.tag);
    });

  return {
    tags,
  };
};
