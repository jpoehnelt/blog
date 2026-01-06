import { getStravaActivities, mapStravaActivity } from "$lib/content/strava";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    activities: [...getStravaActivities()]
      // Data is already sorted descending (newest first) by getStravaActivities().
      // We reverse it to display oldest to newest (ascending) without expensive Date parsing and sorting.
      .reverse()
      .map(mapStravaActivity),
  };
};
