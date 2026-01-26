import { error, redirect } from "@sveltejs/kit";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import racesFallback from "../../../../../../../../data/races.json";
import { getDataDir, readJsonFile } from "$lib/server/utils";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { year, slug } = params;

  const dataDir = await getDataDir();
  const racesFile = path.join(dataDir, "races.json");
  
  let racesData: any[] = racesFallback;
  const loadedRaces = await readJsonFile<any[]>(racesFile);
  if (loadedRaces) {
    racesData = loadedRaces;
  }

  const race = racesData.find(
    (r: any) => r.year === year && r.slug === slug
  );

  if (!race) {
    throw error(404, "Race not found");
  }

  // If there is only one event, redirect directly to it
  if (race.events && race.events.length === 1) {
      throw redirect(307, `/ultras/races/${year}/${slug}/${race.events[0].id}`);
  }

  // Load summary stats for each event
  const eventsWithStats = race.events ? await Promise.all(race.events.map(async (e: any) => {
      let waitlistCount = 0;
      let entrantsCount = 0;

      // Load Waitlist Count
      if (e.waitlist && e.waitlist.dataFile) {
          const dataPath = path.join(dataDir, e.waitlist.dataFile);
          const data = await readJsonFile(dataPath);
          if (Array.isArray(data) && data.length > 0) {
              waitlistCount = data[data.length - 1].count || 0;
          }
      }

      // Load Entrants Count
      if (e.entrants && e.entrants.dataFile) {
          const entrantsPath = path.join(dataDir, e.entrants.dataFile);
          const entrants = await readJsonFile(entrantsPath);
          if (Array.isArray(entrants)) {
              entrantsCount = entrants.length;
          }
      }

      return { ...e, stats: { waitlist: waitlistCount, entrants: entrantsCount } };
  })) : [];

  return {
    race: { ...race, events: eventsWithStats }
  };
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  const dataDir = await getDataDir();
  return getEntries(dataDir);
}

async function getEntries(dataDir: string) {
  const racesFile = path.join(dataDir, "races.json");
  const races = await readJsonFile<any[]>(racesFile);
  
  if (!races || !Array.isArray(races)) return [];
  
  // Return all combinations of year/slug
  return races.map((r) => ({
      year: r.year,
      slug: r.slug
  }));
}
