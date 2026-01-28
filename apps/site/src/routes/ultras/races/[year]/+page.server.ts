import type { Race } from "$lib/types";
import { readFileSync } from "node:fs";

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, parent }) {
  const { year } = params;
  const { races } = await parent();
  
  const racesForYear = races.filter((r) => r.year === year);
  
  return {
    racesForYear,
  };
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  const races: Race[] = JSON.parse(
    readFileSync("./static/data/races.json", "utf-8"),
  );
  return [
    ...new Set(
      races.map((r) => new Date(r.date).getFullYear().toString()),
    ),
  ].map((year) => ({ year }));
}
