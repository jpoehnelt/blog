import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../../data");
const RACES_FILE = path.join(DATA_DIR, "races.json");
const SCRAPER_SCRIPT = path.join(__dirname, "ultrasignup-waitlist.js");

interface RaceConfig {
  id: string;
  year: string;
  date?: string;
  slug: string;
  name: string;
  dataFile: string;
}

async function runScraper(race: RaceConfig) {
  return new Promise<void>((resolve, reject) => {
    console.log(`Starting ingest for ${race.slug} (${race.date || race.year})...`);
    
    // Check if script exists (compiled js)
    if (!fs.existsSync(SCRAPER_SCRIPT)) {
        console.error(`Scraper script not found at ${SCRAPER_SCRIPT}. Did you build?`);
        reject(new Error("Script not found"));
        return;
    }

    const child = spawn("node", [SCRAPER_SCRIPT, "--did", race.id, "--output", race.dataFile], {
      stdio: "inherit",
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(`Scraper failed for ${race.slug} with code ${code}`);
        // We resolve anyway to continue with other races, effectively treating this as a non-fatal error for the batch
        resolve(); 
      }
    });

    child.on("error", (err) => {
      console.error(`Failed to start scraper for ${race.slug}:`, err);
      resolve();
    });
  });
}

function getPriorityScore(race: RaceConfig): number {
    if (!race.date) return 9999999999999; // No date -> last
    return new Date(race.date).getTime();
}

async function main() {
  if (!fs.existsSync(RACES_FILE)) {
    console.error("Races config file not found.");
    process.exit(1);
  }

  let races: RaceConfig[] = JSON.parse(fs.readFileSync(RACES_FILE, "utf-8"));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter out past races (allow 1 day buffer)
  const upcomingRaces = races.filter(race => {
    if (!race.date) return true; // Keep if no date, maybe update it?
    const raceDate = new Date(race.date);
    // Allow races up to 2 days ago (to catch final status)
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 2);
    
    return raceDate >= cutoff;
  });
  
  const skippedCount = races.length - upcomingRaces.length;
  if (skippedCount > 0) {
      console.log(`Skipping ${skippedCount} past races.`);
  }

  // Sort by date ascending (soonest first)
  upcomingRaces.sort((a, b) => getPriorityScore(a) - getPriorityScore(b));

  console.log(`Found ${upcomingRaces.length} active races to ingest.`);

  for (const race of upcomingRaces) {
    await runScraper(race);
    // polite delay between runs
    await new Promise(r => setTimeout(r, 2000));
  }
}

main().catch(console.error);
