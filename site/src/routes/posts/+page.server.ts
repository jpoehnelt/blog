import { getPostsMetadata } from "$lib/content";
import type { PageServerLoad } from "./[id]/$types";

export const load: PageServerLoad = async ({ }) => {
  return {
    posts: getPostsMetadata().sort(
      (a, b) => a.pubDate.getTime() - b.pubDate.getTime(),
    ),
  };
};
