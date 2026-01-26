import { error, redirect } from "@sveltejs/kit";
import fs from "fs";
import path from "path";
import races from "../../../../../../../../data/races.json";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { year, slug } = params;

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

  // If there is only one event, redirect directly to it
  if (race.events && race.events.length === 1) {
      throw redirect(307, `/ultras/races/${year}/${slug}/${race.events[0].id}`);
  }

  // Load summary stats for each event
  const eventsWithStats = race.events ? race.events.map(e => {
      let waitlistCount = 0;
      let entrantsCount = 0;

      // Load Waitlist Count
      if (e.waitlist && e.waitlist.dataFile) {
          const dataPath = path.join(dataDir, e.waitlist.dataFile);
          if (fs.existsSync(dataPath)) {
              try {
                  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
                  if (Array.isArray(data) && data.length > 0) {
                      waitlistCount = data[data.length - 1].count || 0;
                  }
              } catch (err) {
                  console.error(`Error reading waitlist stats for ${e.title}:`, err);
              }
          }
      }

      // Load Entrants Count
      if (e.entrants && e.entrants.dataFile) {
          const entrantsPath = path.join(dataDir, e.entrants.dataFile);
          if (fs.existsSync(entrantsPath)) {
              try {
                  const entrants = JSON.parse(fs.readFileSync(entrantsPath, "utf-8"));
                  if (Array.isArray(entrants)) {
                      entrantsCount = entrants.length;
                  }
              } catch (err) {
                   console.error(`Error reading entrants stats for ${e.title}:`, err);
              }
          }
      }

      return { ...e, stats: { waitlist: waitlistCount, entrants: entrantsCount } };
  }) : [];

  return {
    race: { ...race, events: eventsWithStats }
  };
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
  const dataDir = path.resolve(process.cwd(), "../../data");
  if (!fs.existsSync(dataDir) && fs.existsSync(path.resolve(process.cwd(), "data"))) {
      // Fallback if CWD is root
      return getEntries(path.resolve(process.cwd(), "data"));
  }
  return getEntries(dataDir);
}

function getEntries(dataDir) {
  const racesFile = path.join(dataDir, "races.json");
  if (!fs.existsSync(racesFile)) return [];

  const races = JSON.parse(fs.readFileSync(racesFile, "utf-8"));
  
  // Return all combinations of year/slug
  return races.map((r) => ({
      year: r.year,
      slug: r.slug
  }));
}
