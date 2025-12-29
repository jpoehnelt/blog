import { getStravaActivities, mapStravaActivity } from "$lib/content/strava";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    // Create a copy to avoid mutating the cached array
    activities: [...getStravaActivities()]
      .sort((a, b) => {
        // Optimization: Compare ISO strings directly to avoid expensive Date parsing
        if (a.start_date > b.start_date) return 1;
        if (a.start_date < b.start_date) return -1;
        return 0;
      })
      .map(mapStravaActivity),
  };
};
