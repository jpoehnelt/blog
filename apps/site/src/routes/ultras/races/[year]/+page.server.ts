import { error } from "@sveltejs/kit";
import fs from "fs";
import path from "path";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { year } = params;

  // Handle monorepo structure: try root data dir or relative to site
  let dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
      // If CWD is apps/site, go up two levels
      dataDir = path.resolve(process.cwd(), "../../data");
  }

  const racesFile = path.join(dataDir, "races.json");

  if (!fs.existsSync(racesFile)) {
    return {
        races: [],
        years: [],
        selectedYear: year
    };
  }

  const races = JSON.parse(fs.readFileSync(racesFile, "utf-8"));

  // Get all unique years
  const years = [...new Set(races.map((r) => r.year))].sort().reverse();

  // Filter races for selected year and sort by date
  const racesForYear = races
    .filter((r) => r.year === year)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    races: racesForYear,
    years,
    selectedYear: year,
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
  const years = [...new Set(races.map((r) => r.year))];
  
  return years.map(year => ({ year }));
}
