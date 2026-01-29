import { redirect } from "@sveltejs/kit";

export async function load({ parent }) {
  const { races } = await parent();

  let latestYear = new Date().getFullYear().toString();

  if (races && Array.isArray(races) && races.length > 0) {
    const years = [...new Set(races.map((r) => r.year))].sort().reverse();
    if (years.length > 0) {
      latestYear = String(years[0]);
    } else {
      latestYear = String(races[races.length - 1].year);
    }
  }

  throw redirect(307, `/ultras/races/${latestYear}`);
}
