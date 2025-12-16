import { getStravaActivities } from "$lib/content/strava";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return {
    activities: getStravaActivities().sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    ),
  };
};
