import { ParticipantSchema } from "@jpoehnelt/ultrasignup-scraper/types";
import { z } from "zod";

interface CompetitivenessStats {
  averageRank: number;
  eliteCount: number;
  rankedEntrants: number;
  totalEntrants: number;
  top20Rank: number | null;
}

const MIN_RESULTS_FOR_RANKING = 5;

function calculateCompetitiveness(
  entrants: { rank?: number | null; results?: number | null }[],
): CompetitivenessStats | null {
  if (!entrants || entrants.length === 0) return null;

  // Only include runners with 5+ finishes for accurate rankings
  const rankedEntrants = entrants.filter(
    (e) => e.rank && e.rank > 0 && (e.results ?? 0) >= MIN_RESULTS_FOR_RANKING,
  );
  const ranks = rankedEntrants.map((e) => e.rank!).sort((a, b) => b - a);

  if (ranks.length === 0) return null;

  const eliteCount = ranks.filter((r) => r >= 90).length;
  const sum = ranks.reduce((a, b) => a + b, 0);
  const averageRank = sum / ranks.length;

  const top20Rank = ranks.length >= 20 ? ranks[19] : null;

  return {
    averageRank,
    eliteCount,
    rankedEntrants: rankedEntrants.length,
    totalEntrants: entrants.length,
    top20Rank,
  };
}

export interface CompetitiveEvent {
  id: number;
  eventId: number;
  raceId: number;
  title: string; // Event-specific title like "100K"
  raceTitle: string; // Parent race title like "Black Canyon Ultras"
  fullTitle: string; // Combined: "Black Canyon Ultras 100K"
  year: number;
  date: string;
  location: string;
  slug: string;
  competitiveness: CompetitivenessStats | null;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, fetch }) {
  const { races } = await parent();

  // Flatten races into individual events with competitiveness
  const eventsWithCompetitiveness: CompetitiveEvent[] = [];

  // Deduplicate runners by name across all events for scatter plot
  const runnerMap = new Map<string, { rank: number; results: number }>();

  await Promise.all(
    races.flatMap((race: any) =>
      (race.events || []).map(async (event: any) => {
        try {
          const dataFile = event.entrants?.dataFile;
          if (!dataFile) return;

          const entrantsPath = `/data/${dataFile}`;
          const response = await fetch(entrantsPath);
          if (!response.ok) return;

          const data = await response.json();
          const entrants = z.array(ParticipantSchema).safeParse(data);
          if (!entrants.success) return;

          // Collect runner-level data for scatter plot (deduplicated by name)
          for (const e of entrants.data) {
            if (e.rank && e.rank > 0 && e.results && e.results > 0) {
              const key = `${e.firstName}_${e.lastName}`;
              if (!runnerMap.has(key)) {
                runnerMap.set(key, { rank: e.rank, results: e.results });
              }
            }
          }

          const competitiveness = calculateCompetitiveness(entrants.data);
          if (!competitiveness) return;

          eventsWithCompetitiveness.push({
            id: event.id,
            eventId: event.id,
            raceId: race.id,
            title: event.title,
            raceTitle: race.title,
            fullTitle: `${race.title} ${event.title}`,
            year: race.year,
            date: race.date,
            location: race.location,
            slug: race.slug,
            competitiveness,
          });
        } catch {
          // Skip events with errors
        }
      }),
    ),
  );

  // Sort by top20Rank (primary), then elite count (secondary)
  const sortedEvents = eventsWithCompetitiveness.sort((a, b) => {
    // Primary sort: top 20 rank (descending)
    const top20Diff =
      (b.competitiveness?.top20Rank ?? 0) - (a.competitiveness?.top20Rank ?? 0);
    if (top20Diff !== 0) return top20Diff;
    // Secondary sort: elite count (descending)
    return (
      (b.competitiveness?.eliteCount ?? 0) -
      (a.competitiveness?.eliteCount ?? 0)
    );
  });

  // Sample scatter data if too large (max 2000 points)
  let scatterData = Array.from(runnerMap.values());
  if (scatterData.length > 2000) {
    const step = Math.ceil(scatterData.length / 2000);
    scatterData = scatterData.filter((_, i) => i % step === 0);
  }

  return {
    races: sortedEvents,
    scatterData,
  };
}
