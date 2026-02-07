import { ParticipantSchema } from "@jpoehnelt/ultrasignup-scraper/types";
import { z } from "zod";

interface CompetitivenessStats {
  averageRank: number;
  eliteCount: number;
  rankedEntrants: number;
  totalEntrants: number;
  top20Rank: number | null;
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

  const top20Rank = ranks.length >= 20 ? ranks[19] : null;

  return {
    averageRank,
    eliteCount,
    rankedEntrants: rankedEntrants.length,
    totalEntrants: entrants.length,
    top20Rank,
  };
}

interface CompetitiveEvent {
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

          const competitiveness = calculateCompetitiveness(entrants.data);
          if (!competitiveness) return;

          eventsWithCompetitiveness.push({
            id: event.id,
            eventId: event.id,
            raceId: race.id,
            title: event.title, // e.g., "100K"
            raceTitle: race.title, // e.g., "Black Canyon Ultras"
            fullTitle: `${race.title} ${event.title}`, // e.g., "Black Canyon Ultras 100K"
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

  return {
    races: sortedEvents,
  };
}
