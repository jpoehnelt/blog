import { getPostsMetadata, getTagsWithCounts } from "$lib/content/posts.server";
import { getStravaActivities, mapStravaActivity } from "$lib/content/strava";
import type { DetailedActivityResponse } from "strava-v3";
import {
  startOfDay,
  startOfYear,
  differenceInDays,
  addDays,
  isAfter,
  isSameDay,
} from "date-fns";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const posts = getPostsMetadata();
  const activities = getStravaActivities();
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

  const recentActivities: DetailedActivityResponse[] = [];
  const recentRaces: DetailedActivityResponse[] = [];

  // Populate with activity data
  // Optimization: Single pass over sorted activities instead of multiple filters
  for (const activity of activities) {
    // Only process runs
    if ((activity as any).type !== "Run" && activity.sport_type !== "Run")
      continue;
    if (!activity.start_date) continue;

    const activityDate = startOfDay(new Date(activity.start_date));
    const isThisYear = isAfter(activityDate, addDays(startOfYearDate, -1));

    // 1. Collect Recent Activities (Top 10)
    if (recentActivities.length < 10) {
      recentActivities.push(activity);
    }

    // 2. Collect Recent Races (Top 10)
    // workout_type: 1 is a race
    if ((activity as any).workout_type === 1 && recentRaces.length < 10) {
      recentRaces.push(activity);
    }

    // 3. Populate Chart Data (Current Year Only)
    if (isThisYear) {
      const index = differenceInDays(activityDate, startOfYearDate);
      if (index >= 0 && index < runningChartData.length) {
        runningChartData[index].distance += (activity.distance || 0) / 1000;
      }
    }

    // Optimization: Stop if we have enough data and are past the current year
    if (
      !isThisYear &&
      recentActivities.length >= 10 &&
      recentRaces.length >= 10
    ) {
      break;
    }
  }

  return {
    posts,
    tags,
    recentActivities: recentActivities.map(mapStravaActivity),
    recentRaces: recentRaces.map(mapStravaActivity),
    runningChartData,
  };
};
