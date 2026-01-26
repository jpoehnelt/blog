import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { scrape } from "./scrape.js";
import { scrapeEntrants } from "./scrape-entrants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../../../data");
const RACES_FILE = path.join(DATA_DIR, "races.json");

interface WaitlistInfo {
    dataFile: string;
}

interface EventConfig {
  id: string;
  title: string;
  waitlist?: WaitlistInfo;
  entrants?: WaitlistInfo;
}

interface RaceConfig {
  id?: string;
  year: string;
  date?: string;
  slug: string;
  name: string;
  dataFile?: string;
  events?: EventConfig[];
}

function getPriorityScore(race: RaceConfig): number {
    if (!race.date) return 9999999999999;
    return new Date(race.date).getTime();
}

export async function ingest() {
  if (!fs.existsSync(RACES_FILE)) {
    console.error("Races config file not found.");
    process.exit(1);
  }

  let races: RaceConfig[] = JSON.parse(fs.readFileSync(RACES_FILE, "utf-8"));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingRaces = races.filter(race => {
    if (!race.date) return true;
    const raceDate = new Date(race.date);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 2);
    
    return raceDate >= cutoff;
  });
  
  const skippedCount = races.length - upcomingRaces.length;
  if (skippedCount > 0) {
      console.log(`Skipping ${skippedCount} past races.`);
  }

  upcomingRaces.sort((a, b) => getPriorityScore(a) - getPriorityScore(b));

  console.log(`Found ${upcomingRaces.length} active races to ingest.`);

  for (const race of upcomingRaces) {
    try {
        console.log(`Starting ingest for ${race.slug} (${race.date || race.year})...`);
        
        if (race.events) {
            for (const event of race.events) {
                if (event.waitlist) {
                    console.log(`  - Ingesting waitlist for ${event.title} (${event.id})...`);
                    await scrape({ did: parseInt(event.id), output: event.waitlist.dataFile });
                    await new Promise(r => setTimeout(r, 1000));
                }
                if (event.entrants) {
                    console.log(`  - Ingesting entrants for ${event.title} (${event.id})...`);
                    await scrapeEntrants({ did: parseInt(event.id), output: event.entrants.dataFile });
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        } else if (race.id && race.dataFile) {
             // Backward compatibility (though we've migrated races.json, keeps CLI robust)
             await scrape({ did: parseInt(race.id), output: race.dataFile });
        }

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error(`Failed to ingest ${race.slug}:`, message);
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
}

export const command = "ingest";
export const describe = "Intelligently ingest data for all active races";
export const builder = {};
export const handler = async () => {
  await ingest();
};
