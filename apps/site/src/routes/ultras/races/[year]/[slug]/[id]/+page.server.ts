import { error } from "@sveltejs/kit";
import fs from "fs";
import path from "path";
import races from "../../../../../../../../../data/races.json";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
// Force reload timestamp: 1234567
  const { year, slug, id } = params;

  // Handle monorepo structure: try root data dir or relative to site
  let dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
      // If CWD is apps/site, go up two levels
      dataDir = path.resolve(process.cwd(), "../../data");
  }
  const racesFile = path.join(dataDir, "races.json");
  let racesData = races; // Fallback to imported
  
  if (fs.existsSync(racesFile)) {
      try {
          racesData = JSON.parse(fs.readFileSync(racesFile, "utf-8"));
      } catch (e) {
          console.error("Failed to read races.json from disk, using fallback", e);
      }
  }

  const race = racesData.find(
    (r) => r.year === year && r.slug === slug
  );

  if (!race) {
    throw error(404, "Race not found");
  }

  // Verify the ID belongs to this race (either as the race ID or an event ID)
  const isValidId = race.id === id || (race.events && race.events.some(e => e.id === id));
  if (!isValidId) {
      throw error(404, "Event ID not found in race");
  }



  console.log("CWD:", process.cwd());
  
  const events = [];

  const targetEvent = race.events?.find(e => e.id === id);

  if (targetEvent) {
      // Loop is technically unnecessary if we only process one, 
      // but keeping structure similar or just processing 'targetEvent'
      const e = targetEvent;
      let data = null;
          try {
            if (e.waitlist && e.waitlist.dataFile) {
                const dataPath = path.join(dataDir, e.waitlist.dataFile);
                if (fs.existsSync(dataPath)) {
                    try {
                        data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
                    } catch (err) {
                        console.error(`Error parsing data file for ${e.title} at ${dataPath}:`, err);
                    }
                } else {
                    // console.log(`Data file not found: ${dataPath}`);
                }
            }
          } catch (err) {
              console.error(`Error processing event waitlist ${e.title}:`, err);
          }
          
          let entrants = null;
          try {
             if (e.entrants && e.entrants.dataFile) {
                const entrantsPath = path.join(dataDir, e.entrants.dataFile);
                 if (fs.existsSync(entrantsPath)) {
                    try {
                        entrants = JSON.parse(fs.readFileSync(entrantsPath, "utf-8"));
                    } catch (err) {
                         console.error(`Error parsing entrants file for ${e.title} at ${entrantsPath}:`, err);
                    }
                 }
             }
          } catch (err) {
              console.error(`Error processing event entrants ${e.title}:`, err);
          }

          events.push({ ...e, data, entrants });
      
  } 
  // Removed fallback for root dataFile as races.json has been fully migrated
  
  return {
    race,
    events,
  };
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  const dataDir = path.resolve(process.cwd(), "../../data");
  if (!fs.existsSync(dataDir) && fs.existsSync(path.resolve(process.cwd(), "data"))) {
      return getEntries(path.resolve(process.cwd(), "data"));
  }
  return getEntries(dataDir);
}

function getEntries(dataDir) {
  const racesFile = path.join(dataDir, "races.json");
  if (!fs.existsSync(racesFile)) return [];

  const races = JSON.parse(fs.readFileSync(racesFile, "utf-8"));
  
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


