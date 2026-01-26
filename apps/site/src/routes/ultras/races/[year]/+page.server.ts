import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getDataDir, readJsonFile } from "$lib/server/utils";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { year } = params;
  const dataDir = await getDataDir();
  const racesFile = path.join(dataDir, "races.json");

  const races = await readJsonFile(racesFile);

  if (!races || !Array.isArray(races)) {
    return {
        races: [],
        years: [],
        selectedYear: year
    };
  }

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
export async function entries() {
  const dataDir = await getDataDir();
  return getEntries(dataDir);
}

async function getEntries(dataDir: string) {
  const racesFile = path.join(dataDir, "races.json");
  const races = await readJsonFile<any[]>(racesFile);
  
  if (!races || !Array.isArray(races)) return [];
  const years = [...new Set(races.map((r) => r.year))];
  
  return years.map(year => ({ year }));
}
