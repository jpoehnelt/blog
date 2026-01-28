import { WaitlistHistorySchema, ParticipantsDataSchema } from "@jpoehnelt/ultrasignup-scraper";
import { error } from "@sveltejs/kit";
import { readFileSync } from "node:fs";
import type { Race } from "$lib/types";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, parent }) {
  const { id } = params;

  // Get race from layout
  const { race } = await parent();

  // Verify the ID belongs to this race (either as the race ID or an event ID)
  const isValidId = race.id === id || (race.events && race.events.some((e: any) => String(e.id) === String(id)));
  if (!isValidId) {
      throw error(404, "Event ID not found in race");
  }
  
  const events = [];
  
  const targetEvent = race.events?.find((e: any) => String(e.id) === String(id));

  if (targetEvent) {
      const e = targetEvent;
      
      const [waitlistRes, entrantsRes] = await Promise.all([
          e.waitlist?.dataFile ? fetch(`/data/${e.waitlist.dataFile}`).catch(err => {
              console.error(`Error fetching waitlist for ${e.title}:`, err);
              return null;
          }) : Promise.resolve(null),
          e.entrants?.dataFile ? fetch(`/data/${e.entrants.dataFile}`).catch(err => {
              console.error(`Error fetching entrants for ${e.title}:`, err);
              return null;
          }) : Promise.resolve(null)
      ]);

      let data = null;
      if (waitlistRes?.ok) {
          try {
              const raw = await waitlistRes.json();
              data = WaitlistHistorySchema.parse(raw);
          } catch (err) {
              console.error(`Error parsing waitlist for ${e.title}:`, err);
          }
      }

      let entrants = null;
      if (entrantsRes?.ok) {
          try {
              const raw = await entrantsRes.json();
              entrants = ParticipantsDataSchema.parse(raw);
          } catch (err) {
              console.error(`Error parsing entrants for ${e.title}:`, err);
          }
      }

      events.push({ ...e, data, entrants });
  } 
  
  return {
    race,
    events,
  };
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  let typedRaces: Race[] = [];
  try {
      const data = readFileSync("./static/data/races.json", "utf-8");
      typedRaces = JSON.parse(data);
  } catch (e) {
      // Fallback for when running from project root or different cwd
      try {
          const data = readFileSync("apps/site/static/data/races.json", "utf-8");
          typedRaces = JSON.parse(data);
      } catch (e2) {
          console.error("Failed to load races.json in entries", e2);
          return [];
      }
  }

  if (!typedRaces || !Array.isArray(typedRaces)) return [];
  
  // Return all events for all races
  const entries = [];
  for (const race of typedRaces) {
      if (race.events) {
          for (const event of race.events) {
              entries.push({
                  year: race.year,
                  slug: race.slug,
                  id: String(event.id)
              });
          }
      }
      // If race has ID directly (legacy/single event), add it.
      if (race.id && !race.events) {
          entries.push({
              year: race.year,
              slug: race.slug,
              id: String(race.id)
          });
      }
  }
  return entries;
}

