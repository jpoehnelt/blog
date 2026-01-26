import { redirect } from '@sveltejs/kit';
import path from "path";
import { getDataDir, readJsonFile } from "$lib/server/utils";

export async function load() {
    const dataDir = await getDataDir();
    const racesFile = path.join(dataDir, "races.json");
    const races = await readJsonFile(racesFile);

    let latestYear = "2026";
    if (races && Array.isArray(races) && races.length > 0) {
        const years = [...new Set(races.map((r) => r.year))].sort().reverse();
        if (years.length > 0) {
            latestYear = years[0];
        }
    }

	throw redirect(307, `/ultras/races/${latestYear}`);
}
