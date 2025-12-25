import { getPostsMetadata, getTagsWithCounts } from "$lib/content/posts.server";
import { getStravaActivities, mapStravaActivity } from "$lib/content/strava";
import { startOfDay, startOfYear, differenceInDays, addDays } from "date-fns";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const posts = getPostsMetadata();
  const allActivities = getStravaActivities().filter(
    (a: any) => a.type === "Run" || a.sport_type === "Run",
  );
  const races = allActivities.filter((a) => (a as any).workout_type === 1);
  const tags = getTagsWithCounts();

  const today = startOfDay(new Date());
  const startOfYearDate = startOfYear(today);
  const daysCount = differenceInDays(today, startOfYearDate) + 1;

  // Initialize YTD days
  const runningChartData = Array.from({ length: daysCount }, (_, i) => {
    const date = addDays(startOfYearDate, i);
    return {
      date,
      distance: 0,
    };
  });

  // Populate with activity data
  for (const activity of allActivities) {
    if (!activity.start_date) continue;
    const activityDate = startOfDay(new Date(activity.start_date));

    // Since activities are sorted by date descending, we can stop once we reach last year
    if (activityDate < startOfYearDate) break;

    const dayIndex = differenceInDays(activityDate, startOfYearDate);
    if (dayIndex >= 0 && dayIndex < runningChartData.length) {
      runningChartData[dayIndex].distance += (activity.distance || 0) / 1000;
    }
  }

  return {
    posts,
    tags,
    recentActivities: allActivities.slice(0, 10).map(mapStravaActivity),
    recentRaces: races.slice(0, 10).map(mapStravaActivity),
    runningChartData,
  };
};
