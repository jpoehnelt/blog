import { ParticipantSchema } from "@jpoehnelt/ultrasignup-scraper/types";
import { z } from "zod";

interface CompetitivenessStats {
  averageRank: number;
  eliteCount: number;
  rankedEntrants: number;
  totalEntrants: number;
  top20Rank: number | null;
  top20Average: number | null;
}

function calculateCompetitiveness(
  entrants: z.infer<typeof ParticipantSchema>[],
): CompetitivenessStats | null {
  if (!entrants || entrants.length === 0) return null;

  // For accurate rankings, only include runners with 5+ results (UltraSignup requirement)
  const MIN_RESULTS_FOR_RANKING = 5;
  const rankedEntrants = entrants.filter(
    (e: z.infer<typeof ParticipantSchema>) =>
      e.rank && e.rank > 0 && (e.results ?? 0) >= MIN_RESULTS_FOR_RANKING,
  );
  const ranks = rankedEntrants.map((e) => e.rank!).sort((a, b) => b - a);

  if (ranks.length === 0) return null;

  const eliteCount = ranks.filter((r) => r >= 90).length;
  const sum = ranks.reduce((a, b) => a + b, 0);
  const averageRank = sum / ranks.length;

  const top20Rank = ranks.length >= 20 ? ranks[19] : null;

  const top20Ranks = ranks.slice(0, 20);
  const top20Sum = top20Ranks.reduce((a, b) => a + b, 0);
  const top20Average =
    top20Ranks.length > 0 ? top20Sum / top20Ranks.length : null;

  return {
    averageRank,
    eliteCount,
    rankedEntrants: rankedEntrants.length,
    top20Rank,
    top20Average,
    totalEntrants: entrants.length,
  };
}

// Minimal types for races.json structure
interface RaceEvent {
  id: number;
  title: string;
  slug?: string;
  entrants?: { dataFile: string };
}

interface RaceSummary {
  id: number;
  title: string;
  slug: string;
  date: string | Date;
  location: string;
  events?: RaceEvent[];
  parentId?: number;
  website?: string;
  lat?: number;
  lng?: number;
}

export const load = async ({ parent, params, fetch }) => {
  const { races } = await parent();

  const racesForYear = races.filter(
    (r: RaceSummary) =>
      new Date(r.date).getFullYear().toString() === params.year,
  );

  // Load competitiveness for each race
  // Load competitiveness for ALL events (flattened)
  const eventsForYear = (
    await Promise.all(
      racesForYear.flatMap((race: RaceSummary) =>
        (race.events || []).map(async (event: RaceEvent) => {
          // Use the entrants dataFile path from the specific event
          const dataFile = event.entrants?.dataFile;
          if (!dataFile) return null;

          const entrantsPath = `/data/${dataFile}`;
          try {
            const response = await fetch(entrantsPath);
            if (!response.ok) return null;

            const data = await response.json();
            const entrants = z.array(ParticipantSchema).safeParse(data);
            if (!entrants.success) return null;

            const competitiveness = calculateCompetitiveness(entrants.data);
            if (!competitiveness) return null;

            return {
              id: event.id, // Event ID
              raceId: race.id,
              eventId: event.id,
              title: `${race.title} ${event.title}`,
              slug: race.slug,
              year: params.year,
              date: race.date,
              location: race.location,
              events: [event],
              competitiveness,
            };
          } catch (e) {
            return null;
          }
        }),
      ),
    )
  ).filter((e): e is NonNullable<typeof e> => e !== null);

  // Calculate Year Aggregates based on Events
  const eventsWithStats = eventsForYear.filter(
    (e) => e.competitiveness && e.competitiveness.totalEntrants >= 50,
  );

  const yearStats = {
    averageRank: 0,
    medianRank: 0,
    minAvgRank: 0,
    maxAvgRank: 0,
    totalElite: 0,
    averageEliteCount: 0,
    averageElitePercent: 0,
    averageTop20Rank: 0,
    minTop20Rank: 0,
    maxTop20Rank: 0,
    minTotalEntrants: 0,
    maxTotalEntrants: 0,
    averageTotalEntrants: 0,
    raceCount: eventsWithStats.length,
  };

  if (eventsWithStats.length > 0) {
    const avgRanks = eventsWithStats.map((r) => r.competitiveness!.averageRank);
    const sortedAvgRanks = [...avgRanks].sort((a, b) => a - b);

    // Calculate Median Rank
    const mid = Math.floor(sortedAvgRanks.length / 2);
    yearStats.medianRank =
      sortedAvgRanks.length % 2 !== 0
        ? sortedAvgRanks[mid]
        : (sortedAvgRanks[mid - 1] + sortedAvgRanks[mid]) / 2;

    yearStats.averageRank =
      avgRanks.reduce((a, b) => a + b, 0) / avgRanks.length;
    yearStats.minAvgRank = Math.min(...avgRanks);
    yearStats.maxAvgRank = Math.max(...avgRanks);

    const eliteCounts = eventsWithStats.map(
      (r) => r.competitiveness!.eliteCount,
    );
    yearStats.averageEliteCount =
      eliteCounts.reduce((a, b) => a + b, 0) / eliteCounts.length;

    const elitePercents = eventsWithStats.map((r) =>
      r.competitiveness!.totalEntrants > 0
        ? (r.competitiveness!.eliteCount / r.competitiveness!.totalEntrants) *
          100
        : 0,
    );
    yearStats.averageElitePercent =
      elitePercents.reduce((a, b) => a + b, 0) / elitePercents.length;

    yearStats.totalElite = eventsWithStats.reduce(
      (a, r) => a + r.competitiveness!.eliteCount,
      0,
    );

    const top20Ranks = eventsWithStats
      .map((r) => r.competitiveness!.top20Rank)
      .filter((r): r is number => r !== null);

    if (top20Ranks.length > 0) {
      yearStats.averageTop20Rank =
        top20Ranks.reduce((a, b) => a + b, 0) / top20Ranks.length;
      yearStats.minTop20Rank = Math.min(...top20Ranks);
      yearStats.maxTop20Rank = Math.max(...top20Ranks);
    }

    const totalEntrants = eventsWithStats.map(
      (r) => r.competitiveness!.totalEntrants,
    );
    if (totalEntrants.length > 0) {
      yearStats.averageTotalEntrants =
        totalEntrants.reduce((a, b) => a + b, 0) / totalEntrants.length;
      yearStats.minTotalEntrants = Math.min(...totalEntrants);
      yearStats.maxTotalEntrants = Math.max(...totalEntrants);
    }
  }

  return {
    eventsForYear,
    racesForYear,
    yearStats,
  };
};
