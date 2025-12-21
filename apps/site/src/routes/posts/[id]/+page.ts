import { getPostContent } from "$lib/content/posts";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, data }) => {
  const PostContent = await getPostContent(params.id);

  return {
    PostContent,
    ...data,
  };
};
