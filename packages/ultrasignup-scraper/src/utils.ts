/**
 * Utility functions for the ultrasignup-scraper CLI
 * Extracted for testability
 */

import * as fs from "fs/promises";

/**
 * Convert text to a URL-safe slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/g, "");
};

// Minimum criteria for a race to be considered "competitive/popular"
export const MIN_ENTRANTS = 50;
export const MIN_WAITLIST = 1;
export const MIN_ELITE_COUNT = 1; // Entrants with rank >= 90

/**
 * Determines if a race is competitive based on event data
 */
export function isCompetitiveRace(
  events: { participants: any[]; waitlist: any[] }[],
): boolean {
  let totalEntrants = 0;
  let totalWaitlist = 0;
  let eliteCount = 0;

  for (const event of events) {
    totalEntrants += event.participants?.length || 0;
    totalWaitlist += event.waitlist?.length || 0;
    eliteCount += (event.participants || []).filter(
      (p) => p.rank && p.rank >= 90,
    ).length;
  }

  // Race is competitive if it has: significant waitlist OR many entrants OR elite runners
  return (
    totalWaitlist >= MIN_WAITLIST ||
    totalEntrants >= MIN_ENTRANTS ||
    eliteCount >= MIN_ELITE_COUNT
  );
}

/**
 * Upsert race data into a races.json file
 */
export async function updateRacesJson(
  newRaceData: { id: number; date: Date | string; [key: string]: any },
  racesJsonPath: string,
): Promise<void> {
  let races: any[] = [];
  try {
    const content = await fs.readFile(racesJsonPath, "utf-8");
    races = JSON.parse(content);
  } catch (e) {
    // File doesn't exist or empty, start fresh
  }

  // Upsert
  const idx = races.findIndex((r) => r.id === newRaceData.id);
  if (idx >= 0) {
    races[idx] = newRaceData;
  } else {
    races.push(newRaceData);
  }

  // Sort by date
  races.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  await fs.writeFile(racesJsonPath, JSON.stringify(races, null, 2));
}
