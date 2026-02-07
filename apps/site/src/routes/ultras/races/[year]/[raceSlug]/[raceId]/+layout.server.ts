import { error } from "@sveltejs/kit";
import type { Race } from "@jpoehnelt/ultrasignup-scraper/types";

export const load = async ({ parent, params }) => {
  const { raceId } = params;
  const { racesForSlug, enrichment } = await parent();
  const races = racesForSlug as Race[];

  const race = races.find((r) => r.id === parseInt(raceId));

  if (!race) {
    throw error(404, "Race not found");
  }

  return {
    race: { ...race, year: params.year },
    enrichment,
  };
};
