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
import myRacesData from "$data/my-races.json";

import type { PageServerLoad } from "./$types";

interface MyRace {
  raceId: number;
  eventId: number;
  title: string;
  eventTitle: string;
  date: string;
  location: string;
  type: "entrant" | "waitlist";
  position?: number;
  totalCount?: number;
  slug: string;
}

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

  // Get my races from precomputed data (future races only)
  const myRaces = ((myRacesData.races || []) as MyRace[]).filter(
    (r) => new Date(r.date) > now,
  );

  return {
    posts,
    tags,
    recentActivities: allActivities.slice(0, 10).map(mapStravaActivity),
    recentRaces: races.slice(0, 10).map(mapStravaActivity),
    runningChartData,
    // Race widget data
    raceStats: {
      totalRaces,
      eliteRunners: totalElites,
      activeWaitlists,
    },
    myRaces,
    hotWaitlists,
    topEliteRaces,
    upcomingRacesWidget,
  };
};
