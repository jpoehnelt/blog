import { ParticipantSchema } from "@jpoehnelt/ultrasignup-scraper/types";
import { z } from "zod";

interface CompetitivenessStats {
  averageRank: number;
  eliteCount: number;
  rankedEntrants: number;
  totalEntrants: number;
}

function calculateCompetitiveness(
  entrants: { rank?: number | null }[],
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
export async function load({ parent, fetch }) {
  const { races } = await parent();

  // Load competitiveness for all races
  const racesWithCompetitiveness = await Promise.all(
    races.map(async (race: any) => {
      const primaryEvent = race.events?.[0];
      if (!primaryEvent) return { ...race, competitiveness: null };

      try {
        const dataFile = primaryEvent.entrants?.dataFile;
        if (!dataFile) return { ...race, competitiveness: null };

        const entrantsPath = `/data/${dataFile}`;
        const response = await fetch(entrantsPath);
        if (!response.ok) return { ...race, competitiveness: null };

        const data = await response.json();
        const entrants = z.array(ParticipantSchema).safeParse(data);
        if (!entrants.success) return { ...race, competitiveness: null };

        const competitiveness = calculateCompetitiveness(entrants.data);
        return { ...race, competitiveness };
      } catch {
        return { ...race, competitiveness: null };
      }
    }),
  );

  // Filter to only races with 10+ elites and sort by elite count, then avg rank
  const competitiveRaces = racesWithCompetitiveness
    .filter((r) => r.competitiveness && r.competitiveness.eliteCount >= 10)
    .sort((a, b) => {
      // Primary sort: elite count (descending)
      const eliteDiff = (b.competitiveness?.eliteCount ?? 0) - (a.competitiveness?.eliteCount ?? 0);
      if (eliteDiff !== 0) return eliteDiff;
      // Secondary sort: average rank (descending)
      return (b.competitiveness?.averageRank ?? 0) - (a.competitiveness?.averageRank ?? 0);
    });

  return {
    races: competitiveRaces,
  };
}
