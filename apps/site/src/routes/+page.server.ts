import { getPostsMetadata, getTagsWithCounts } from "$lib/content/posts";
import { getStravaActivities } from "$lib/content/strava";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const posts = getPostsMetadata();
  const activities = getStravaActivities().filter(
    (a: any) => a.type === "Run" || a.sport_type === "Run",
  );
  const races = activities.filter((a) => (a as any).workout_type === 1);
  const tags = getTagsWithCounts();

  return { posts, tags, activities, races };
};
