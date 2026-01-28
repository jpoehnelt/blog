import { WaitlistHistorySchema, ParticipantsDataSchema } from "@jpoehnelt/ultrasignup-scraper";
import { error, redirect } from "@sveltejs/kit";
import { readFileSync } from "node:fs";
import type { Race } from "$lib/types";

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, parent, params }) {
  const { year, slug } = params; // getting params just for redirect url construction if needed, mostly effectively unused if we use race properties but keeping for safety
  const { race } = await parent();

  // If there is only one event, redirect directly to it
  if (race.events && race.events.length === 1) {
    throw redirect(307, `/ultras/races/${year}/${slug}/${race.events[0].id}`);
  }

   // Load summary stats for each event
  const eventsWithStats = race.events
    ? await Promise.all(
        race.events.map(async (event: any) => {
          const [waitlistRes, entrantsRes] = await Promise.all([
            event.waitlist?.dataFile ? fetch(`/data/${event.waitlist.dataFile}`).catch(() => null) : Promise.resolve(null),
            event.entrants?.dataFile ? fetch(`/data/${event.entrants.dataFile}`).catch(() => null) : Promise.resolve(null)
          ]);

          let waitlistCount = 0;
          let entrantsCount = 0;

          if (waitlistRes?.ok) {
            try {
                const rawData = await waitlistRes.json();
                const waitlistData = WaitlistHistorySchema.parse(rawData);
                if (waitlistData.length > 0) {
                  waitlistCount = waitlistData[waitlistData.length - 1].count || 0;
                }
            } catch (e) {
                console.error(`Failed to parse waitlist for ${event.slug}`, e);
            }
          }

          if (entrantsRes?.ok) {
            try {
                const rawData = await entrantsRes.json();
                const entrantsData = ParticipantsDataSchema.parse(rawData);
                entrantsCount = entrantsData.length;
            } catch (e) {
                 console.error(`Failed to parse entrants for ${event.slug}`, e);
            }
          }

          return {
            ...event,
            stats: { waitlist: waitlistCount, entrants: entrantsCount },
          };
        }),
      )
    : [];

  return {
    race: { ...race, events: eventsWithStats },
  };
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  let races: Race[] = [];
  try {
      const data = readFileSync("./static/data/races.json", "utf-8");
      races = JSON.parse(data);
  } catch (e) {
      try {
          const data = readFileSync("apps/site/static/data/races.json", "utf-8");
          races = JSON.parse(data);
      } catch (e2) {
          console.error("Failed to load races.json in entries", e2);
          return [];
      }
  }

  if (!races || !Array.isArray(races)) return [];

  // Return all combinations of year/slug
  return races.map((r) => ({
    year: r.year,
    slug: r.slug,
  }));
}
