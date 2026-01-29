import { redirect } from "@sveltejs/kit";
import type {
  WaitlistHistory,
  Participant,
} from "@jpoehnelt/ultrasignup-scraper";
import { RaceDataManager } from "$lib/races";

interface CompetitivenessStats {
  averageRank: number;
  eliteCount: number;
  rankedEntrants: number;
  totalEntrants: number;
}

function calculateCompetitiveness(entrants: Participant[]): CompetitivenessStats | null {
  if (!entrants || entrants.length === 0) return null;

  const rankedEntrants = entrants.filter(e => e.rank && e.rank > 0);
  const ranks = rankedEntrants.map(e => e.rank!).sort((a, b) => b - a);
  
  if (ranks.length === 0) return null;

  const eliteCount = ranks.filter(r => r >= 90).length;
  const sum = ranks.reduce((a, b) => a + b, 0);
  const averageRank = sum / ranks.length;

  return {
    averageRank,
    eliteCount,
    rankedEntrants: rankedEntrants.length,
    totalEntrants: entrants.length,
  };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, parent, params }) {
  const { year, raceSlug } = params; // getting params just for redirect url construction if needed, mostly effectively unused if we use race properties but keeping for safety
  const { race } = await parent();

  // If there is only one event, redirect directly to it
  if (race.events && race.events.length === 1) {
    throw redirect(
      307,
      `/ultras/races/${year}/${raceSlug}/${race.id}/${race.events[0].id}`,
    );
  }

  const raceManager = new RaceDataManager(fetch);

  // Load summary stats for each event
  const resolvedEvents = race.events
    ? await Promise.all(
        race.events.map(async (event: any) => {
          const [waitlistData, entrantsData]: [WaitlistHistory, Participant[]] =
            await Promise.all([
              raceManager.getWaitlist(race.id, event.id),
              raceManager.getEntrants(race.id, event.id),
            ]);

          let waitlistCount = 0;
          let entrantsCount = 0;

          if (waitlistData && waitlistData.length > 0) {
            waitlistCount = waitlistData[waitlistData.length - 1].count;
          }
          if (entrantsData && entrantsData.length > 0) {
            entrantsCount = entrantsData.length;
          }
          
          const competitiveness = calculateCompetitiveness(entrantsData);
          
          return {
            ...event,
            stats: { waitlist: waitlistCount, entrants: entrantsCount },
            competitiveness,
            waitlist: {
              data: waitlistData,
            },
            entrants: {
              data: entrantsData,
            },
          };
        }),
      )
    : [];

  return {
    race: { ...race, events: resolvedEvents },
  };
}

