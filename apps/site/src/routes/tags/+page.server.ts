import { getTagsWithCounts } from "$lib/content/posts";

import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async () => {
  const tags = getTagsWithCounts();
  return { tags };
};
