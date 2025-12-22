import { type Post } from "$lib/content/posts";
import { getPostsMetadata } from "$lib/content/posts.server";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const tag = params.tag;
  const posts = getPostsMetadata().filter((p: Post) => p.tags.includes(tag));

  return {
    tag,
    posts,
  };
};
