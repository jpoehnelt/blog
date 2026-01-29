import { error } from "@sveltejs/kit";
import { RaceDataManager } from "$lib/races";


/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent, fetch }) {
  const { raceId, eventId } = params;

  // Get race from layout
  const { race } = await parent();

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

  const events = [
    {
      ...event,
      data: waitlistData,
      entrants: entrantsData,
    },
  ];

  return {
    race,
    events,
  };
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  const raceManager = new RaceDataManager(fetch);
  const races = await raceManager.getRaces();

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
