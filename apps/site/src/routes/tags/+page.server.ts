import { getTagsWithCounts } from "$lib/content/posts.server";

import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async () => {
  const tags = getTagsWithCounts();
  return { tags };
};
