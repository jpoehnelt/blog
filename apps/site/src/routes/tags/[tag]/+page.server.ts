import { getPostsMetadata, type Post } from "$lib/content/posts";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const tag = params.tag;
  const posts = getPostsMetadata().filter((p: Post) => p.tags.includes(tag));

  return {
    tag,
    posts,
  };
};
