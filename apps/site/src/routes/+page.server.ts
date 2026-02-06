import { getPostsMetadata, getTagsWithCounts } from "$lib/content/posts.server";
import { getStravaActivities, mapStravaActivity } from "$lib/content/strava";
import {
  startOfDay,
  startOfYear,
  differenceInDays,
  addDays,
  isAfter,
} from "date-fns";
import { RaceDataManager } from "$lib/races.server";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
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

    // Since activities are sorted desc, if we passed the start of year, we can stop
    if (!isAfter(activityDate, addDays(startOfYearDate, -1))) {
      break;
    }

    const index = differenceInDays(activityDate, startOfYearDate);
    if (index >= 0 && index < runningChartData.length) {
      runningChartData[index].distance += (activity.distance || 0) / 1000;
    }
  }

  // ========== HEATMAP DATA AGGREGATION ==========
  const currentYear = today.getFullYear();

  // Determine years to include (from earliest activity to current year)
  const allYears = new Set<number>();
  for (const activity of allActivities) {
    if (activity.start_date) {
      allYears.add(new Date(activity.start_date).getFullYear());
    }
  }
  const yearsArray = Array.from(allYears).sort((a, b) => a - b);
  const displayYears = yearsArray.slice(-8); // Last 8 years

  // Initialize aggregation structures
  const dayOfWeekByYear: Record<number, number[]> = {};
  const monthByYear: Record<number, number[]> = {};
  const hourByYear: Record<number, number[]> = {};

  for (const year of displayYears) {
    dayOfWeekByYear[year] = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    monthByYear[year] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Jan-Dec
    hourByYear[year] = [0, 0, 0, 0, 0, 0, 0, 0]; // 8 buckets (3-hour each)
  }

  // Calendar data for last 12 months
  const last12MonthsCalendar: Record<
    string,
    { count: number; distance: number }
  > = {};

  // Stats accumulators
  let totalWorkouts = 0;
  let totalDistance = 0;
  let totalTime = 0;
  let totalElevation = 0;
  const dowCounts = [0, 0, 0, 0, 0, 0, 0];
  const monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const hourCounts = [0, 0, 0, 0, 0, 0, 0, 0];

  // Process all activities for heatmap
  for (const activity of allActivities) {
    if (!activity.start_date) continue;

    const activityDate = new Date(activity.start_date);
    const year = activityDate.getFullYear();
    const dayOfWeek = activityDate.getDay();
    const month = activityDate.getMonth();
    const hour = activityDate.getHours();
    const hourBucket = Math.floor(hour / 3); // 0-7 (3-hour buckets)

    // Aggregate by year
    if (displayYears.includes(year)) {
      dayOfWeekByYear[year][dayOfWeek]++;
      monthByYear[year][month]++;
      hourByYear[year][hourBucket]++;
    }

    // Calendar data for last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    if (activityDate >= twelveMonthsAgo) {
      const dateStr = activityDate.toISOString().split("T")[0];
      if (!last12MonthsCalendar[dateStr]) {
        last12MonthsCalendar[dateStr] = { count: 0, distance: 0 };
      }
      last12MonthsCalendar[dateStr].count++;
      last12MonthsCalendar[dateStr].distance += activity.distance || 0;
    }

    // YTD stats (current year only)
    if (year === currentYear) {
      totalWorkouts++;
      totalDistance += activity.distance || 0;
      totalTime += activity.moving_time || 0;
      totalElevation += activity.total_elevation_gain || 0;
    }

    // Overall stats for most active
    dowCounts[dayOfWeek]++;
    monthCounts[month]++;
    hourCounts[hourBucket]++;
  }

  // Find most active day, month, hour
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const hourNames = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

  const maxDowIdx = dowCounts.indexOf(Math.max(...dowCounts));
  const maxMonthIdx = monthCounts.indexOf(Math.max(...monthCounts));
  const maxHourIdx = hourCounts.indexOf(Math.max(...hourCounts));

  const heatmapData = {
    dayOfWeekByYear: displayYears.map((year) => ({
      year,
      data: dayOfWeekByYear[year],
    })),
    monthByYear: displayYears.map((year) => ({
      year,
      data: monthByYear[year],
    })),
    hourByYear: displayYears.map((year) => ({
      year,
      data: hourByYear[year],
    })),
    last12MonthsCalendar: Object.entries(last12MonthsCalendar).map(
      ([date, val]) => ({
        date,
        count: val.count,
        distance: val.distance,
      }),
    ),
    currentYear,
    stats: {
      totalWorkouts,
      totalDistance,
      totalTime,
      totalElevation,
      mostActiveDay: dayNames[maxDowIdx],
      mostActiveDayCount: dowCounts[maxDowIdx],
      mostActiveMonth: monthNames[maxMonthIdx],
      mostActiveMonthCount: monthCounts[maxMonthIdx],
      peakHour: hourNames[maxHourIdx],
      peakHourCount: hourCounts[maxHourIdx],
    },
  };
  // ========== END HEATMAP DATA ==========

  // Load race data for homepage widgets
  const raceManager = new RaceDataManager(fetch);
  const allRaces = await raceManager.getRaces();
  const now = new Date();

  // Filter to future races
  const upcomingRaces = allRaces
    .filter((r) => new Date(r.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Compute stats
  const totalRaces = allRaces.length;
  let totalElites = 0;
  let activeWaitlists = 0;

  // Compute elite count and hot waitlists with velocity
  const raceVelocities: {
    id: number;
    title: string;
    slug: string;
    year: number;
    velocity: number;
  }[] = [];
  const eliteRaces: {
    id: number;
    title: string;
    slug: string;
    year: number;
    eliteCount: number;
    averageRank: number;
  }[] = [];

  for (const race of upcomingRaces) {
    const year = new Date(race.date).getFullYear();
    let raceEliteCount = 0;
    let raceAvgRank = 0;
    let raceVelocity = 0;
    let hasWaitlist = false;

    for (const event of race.events || []) {
      // Count elites from competitiveness if available
      if ((event as any).competitiveness?.eliteCount) {
        raceEliteCount += (event as any).competitiveness.eliteCount;
        raceAvgRank = (event as any).competitiveness.averageRank || 0;
      }

      // Check for waitlist
      if (event.waitlist?.dataFile) {
        hasWaitlist = true;
        activeWaitlists++;

        // Calculate velocity if we have history
        if ((event.waitlist as any).velocity) {
          raceVelocity = Math.max(
            raceVelocity,
            (event.waitlist as any).velocity,
          );
        }
      }
    }

    totalElites += raceEliteCount;

    if (hasWaitlist && raceVelocity > 0) {
      raceVelocities.push({
        id: race.id,
        title: race.title,
        slug: race.slug,
        year,
        velocity: raceVelocity,
      });
    }

    if (raceEliteCount > 0) {
      eliteRaces.push({
        id: race.id,
        title: race.title,
        slug: race.slug,
        year,
        eliteCount: raceEliteCount,
        averageRank: raceAvgRank,
      });
    }
  }

  // Sort by velocity descending
  const hotWaitlists = raceVelocities
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 5);

  // Sort by elite count descending
  const topEliteRaces = eliteRaces
    .sort((a, b) => b.eliteCount - a.eliteCount)
    .slice(0, 3);

  // Prepare upcoming races for widget
  const upcomingRacesWidget = upcomingRaces.slice(0, 5).map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    date: r.date,
    location: r.location,
    year: new Date(r.date).getFullYear(),
  }));

  return {
    posts,
    tags,
    recentActivities: allActivities.slice(0, 10).map(mapStravaActivity),
    recentRaces: races.slice(0, 10).map(mapStravaActivity),
    runningChartData,
    heatmapData,
    // Race widget data
    raceStats: {
      totalRaces,
      eliteRunners: totalElites,
      activeWaitlists,
    },
    hotWaitlists,
    topEliteRaces,
    upcomingRacesWidget,
  };
};
