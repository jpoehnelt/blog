import { error } from "@sveltejs/kit";
import { RaceDataManager } from "$lib/races.server";
import { readFileSync } from "fs";
import { resolve } from "path";
import { getPostsMetadata } from "$lib/content/posts.server";
import type {
  RaceWithCompetitiveness,
  CompetitivenessStats,
} from "$lib/components/race/types";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent, fetch }) {
  const { raceId, eventId } = params;

  // Get race and enrichment from layout
  const { race, enrichment, yearStats, eventsForYear } = await parent();

  // Strict Validation: Block build if critical context is missing
  if (!yearStats) {
    throw error(
      500,
      `Build Blocked: Missing yearStats for ${params.year} (needed for Field Strength Meter)`,
    );
  }

  // Verify the ID belongs to this race
  if (race.id !== Number(raceId)) {
    throw error(404, "Race ID mismatch");
  }

  const event = race.events?.find((e) => e.id === Number(eventId));
  if (!event) {
    throw error(404, "Event not found");
  }

  const raceManager = new RaceDataManager(fetch);
  const [waitlistData, entrantsData] = await Promise.all([
    raceManager.getWaitlist(Number(raceId), Number(eventId)),
    raceManager.getEntrants(Number(raceId), Number(eventId)),
  ]);

  // Relaxed Validation: Log warning but allow build to proceed with empty data
  if (!waitlistData || waitlistData.length === 0) {
    console.warn(
      `[Build Warning] Missing waitlist data for event ${eventId} (${event.title})`,
    );
  }

  if (!entrantsData || entrantsData.length === 0) {
    console.warn(
      `[Build Warning] Missing entrants data for event ${eventId} (${event.title})`,
    );
  }

  const safeWaitlistData = waitlistData || [];
  const safeEntrantsData = entrantsData || [];

  // Calculate "Strongest 2026 Fields" leaderboard
  // This is a ranked list of events by top20Rank, including the current event
  interface PeerWithRank extends RaceWithCompetitiveness {
    isCurrent: boolean;
  }

  let strongestFields: PeerWithRank[] = [];
  const qualifiedRaces = eventsForYear
    .filter(
      (r) =>
        r.competitiveness?.top20Rank && r.competitiveness.totalEntrants >= 50,
    )
    .map((r) => ({
      id: r.id, // This is now unique Event ID from layout
      eventId: r.eventId,
      raceId: r.raceId,
      title: r.title,
      slug: r.slug,
      date: r.date,
      competitiveness: {
        top20Rank: r.competitiveness!.top20Rank!,
        totalEntrants: r.competitiveness!.totalEntrants,
      },
      // Compare unique IDs (string safe)
      isCurrent: String(r.id) === String(eventId),
    }))
    .sort((a, b) => b.competitiveness.top20Rank - a.competitiveness.top20Rank); // Descending by rank

  // Return the full list so the client can calculate ranks and gaps correctly
  strongestFields = qualifiedRaces;

  const events = [
    {
      ...event,
      data: safeWaitlistData,
      entrants: safeEntrantsData,
    },
  ];

  // Get blog posts that reference this race
  const allPosts = getPostsMetadata();
  const relatedPosts = allPosts.filter(
    (post) => post.raceId === Number(raceId) || post.raceId === Number(eventId),
  );

  return {
    race,
    events,
    relatedPosts,
    enrichment: {
      ...enrichment,
      strongestFields, // Ranked leaderboard with current race included
    },
    yearStats,
  };
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  // Read directly from filesystem during pre-rendering
  const racesPath = resolve("../../data/races.json");
  const racesJson = readFileSync(racesPath, "utf-8");
  const races = JSON.parse(racesJson);

  // Return all events for all races
  const entries = [];
  for (const race of races) {
    if (race.events) {
      for (const event of race.events) {
        entries.push({
          year: String(race.year),
          raceSlug: race.slug,
          raceId: String(race.id),
          eventId: String(event.id),
        });
      }
    }
  }
  return entries;
}
