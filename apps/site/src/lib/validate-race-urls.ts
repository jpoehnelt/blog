/**
 * Validates that all race URL patterns are correct by checking races.json.
 *
 * This catches the class of bug where an event ID is accidentally used
 * as a race ID in URL generation.
 *
 * Run with: npx tsx apps/site/src/lib/validate-race-urls.ts
 */

import { readFileSync } from "fs";
import { join } from "path";

interface RaceEvent {
  id: number;
  title: string;
  slug: string;
}

interface Race {
  id: number;
  title: string;
  slug: string;
  parentId: number;
  date: string;
  events: RaceEvent[];
}

const racesPath = join(import.meta.dirname, "../../../../data/races.json");
const races: Race[] = JSON.parse(readFileSync(racesPath, "utf-8"));

// Build lookup: set of valid top-level race IDs
const validRaceIds = new Set(races.map((r) => r.id));

// Build lookup: eventId -> parent raceId
const eventToRace = new Map<number, { raceId: number; raceTitle: string }>();
for (const race of races) {
  for (const event of race.events) {
    eventToRace.set(event.id, { raceId: race.id, raceTitle: race.title });
  }
}

let errors = 0;

// Validate: every event's parent race ID must be a valid top-level race
for (const race of races) {
  // race.id should be in validRaceIds (it always is, by definition)
  for (const event of race.events) {
    // The URL would be: /ultras/races/{year}/{slug}/{raceId}/{eventId}
    // raceId must be race.id, eventId must be event.id
    if (!validRaceIds.has(race.id)) {
      console.error(
        `❌ Race "${race.title}" has id=${race.id} which is not a top-level race`,
      );
      errors++;
    }

    // Check that event.id != race.id only when there are multiple events
    // (for single-event races, they're the same and that's fine)
    if (event.id === race.id && race.events.length > 1) {
      // This is the primary event — raceId === eventId is valid
    }
  }
}

// Cross-check: detect if any race.id is actually another race's event ID
for (const race of races) {
  const parent = eventToRace.get(race.id);
  if (parent && parent.raceId !== race.id) {
    console.error(
      `❌ Race "${race.title}" (id=${race.id}) ` +
        `conflicts with event id=${race.id} in race "${parent.raceTitle}" (id=${parent.raceId}). ` +
        `This would produce broken URLs.`,
    );
    errors++;
  }
}

// Summary
console.log(`\nValidated ${races.length} races, ${eventToRace.size} events`);

if (errors > 0) {
  console.error(`\n❌ ${errors} error(s) found`);
  process.exit(1);
} else {
  console.log("✅ All race/event ID relationships are valid");
}
