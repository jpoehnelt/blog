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
export async function load({ params, parent, fetch }) {
  const { year } = params;
  const { races } = await parent();

  const racesForYear = races.filter((r: any) => r.year === Number(year));

  // Load competitiveness for each race
  const racesWithCompetitiveness = await Promise.all(
    racesForYear.map(async (race: any) => {
      // Try to load the primary event's waitlist data
      const primaryEvent = race.events?.[0];
      if (!primaryEvent) return { ...race, competitiveness: null };

      try {
        // Use the entrants dataFile path (has full rank data, unlike waitlist which only has names)
        const dataFile = primaryEvent.entrants?.dataFile;
        if (!dataFile) return { ...race, competitiveness: null };

        const entrantsPath = `/data/${dataFile}`;
        const response = await fetch(entrantsPath);
        if (!response.ok) return { ...race, competitiveness: null };

        const data = await response.json();
        // Entrants file is a flat array of participants
        const entrants = z.array(ParticipantSchema).safeParse(data);
        if (!entrants.success) return { ...race, competitiveness: null };

        const competitiveness = calculateCompetitiveness(entrants.data);
        return { ...race, competitiveness };
      } catch {
        return { ...race, competitiveness: null };
      }
    }),
  );

  return {
    racesForYear: racesWithCompetitiveness,
  };
}
