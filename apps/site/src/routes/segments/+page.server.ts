import { getStravaSegments } from "$lib/content/strava";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const segments = getStravaSegments();

  // Sort by count of activities (popularity)
  segments.sort(
    (a, b) => (b.activity_ids?.length || 0) - (a.activity_ids?.length || 0),
  );

  return {
    segments: segments.slice(0, 50),
  };
};
