import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import races from "../../../../../../../../../data/races.json";
import { getDataDir, readJsonFile } from "$lib/server/utils";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
// Force reload timestamp: 1234567
  const { year, slug, id } = params;

  const dataDir = await getDataDir();
  const racesFile = path.join(dataDir, "races.json");
  
  let racesData: any[] = races;
  const loadedRaces = await readJsonFile<any[]>(racesFile);
  if (loadedRaces) {
    racesData = loadedRaces;
  }

  const race = racesData.find(
    (r) => r.year === year && r.slug === slug
  );

  if (!race) {
    throw error(404, "Race not found");
  }

  // Verify the ID belongs to this race (either as the race ID or an event ID)
  const isValidId = race.id === id || (race.events && race.events.some((e: any) => e.id === id));
  if (!isValidId) {
      throw error(404, "Event ID not found in race");
  }

  console.log("CWD:", process.cwd());
  
  const events = [];

  const targetEvent = race.events?.find((e: any) => e.id === id);

  if (targetEvent) {
      // Loop is technically unnecessary if we only process one, 
      // but keeping structure similar or just processing 'targetEvent'
      const e = targetEvent;
      let data = null;
          try {
            if (e.waitlist && e.waitlist.dataFile) {
                const dataPath = path.join(dataDir, e.waitlist.dataFile);
                data = await readJsonFile(dataPath);
            }
          } catch (err) {
              console.error(`Error processing event waitlist ${e.title}:`, err);
          }
          
          let entrants = null;
          try {
             if (e.entrants && e.entrants.dataFile) {
                const entrantsPath = path.join(dataDir, e.entrants.dataFile);
                entrants = await readJsonFile(entrantsPath);
             }
          } catch (err) {
              console.error(`Error processing event entrants ${e.title}:`, err);
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
  const dataDir = await getDataDir();
  return getEntries(dataDir);
}

async function getEntries(dataDir: string) {
  const racesFile = path.join(dataDir, "races.json");
  const races = await readJsonFile<any[]>(racesFile);
  
  if (!races || !Array.isArray(races)) return [];
  
  // Return all events for all races
  const entries = [];
  for (const race of races) {
      if (race.events) {
          for (const event of race.events) {
              entries.push({
                  year: race.year,
                  slug: race.slug,
                  id: event.id
              });
          }
      }
      // If race has ID directly (legacy/single event), add it.
      if (race.id && !race.events) {
          entries.push({
              year: race.year,
              slug: race.slug,
              id: race.id
          });
      }
  }
  return entries;
}


