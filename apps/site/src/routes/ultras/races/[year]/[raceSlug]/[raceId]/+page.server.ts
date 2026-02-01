import type {
  WaitlistHistory,
  Participant,
} from "@jpoehnelt/ultrasignup-scraper/types";
import { RaceDataManager } from "$lib/races.server";

interface CompetitivenessStats {
  averageRank: number;
  eliteCount: number;
  rankedEntrants: number;
  totalEntrants: number;
}

function calculateCompetitiveness(
  entrants: Participant[],
): CompetitivenessStats | null {
  if (!entrants || entrants.length === 0) return null;

  const rankedEntrants = entrants.filter((e) => e.rank && e.rank > 0);
  const ranks = rankedEntrants.map((e) => e.rank!).sort((a, b) => b - a);

  if (ranks.length === 0) return null;

  const eliteCount = ranks.filter((r) => r >= 90).length;
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
  const { year, raceSlug } = params;
  const { race } = await parent();

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
