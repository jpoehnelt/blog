import { getPostsMetadata } from "$lib/content/posts.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    posts: getPostsMetadata().sort(
      (a, b) => a.pubDate.getTime() - b.pubDate.getTime(),
    ),
  };
};
