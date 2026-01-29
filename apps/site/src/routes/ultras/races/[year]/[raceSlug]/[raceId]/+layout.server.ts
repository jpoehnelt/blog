import { error } from "@sveltejs/kit";
import type { Race } from "@jpoehnelt/ultrasignup-scraper";

export const load = async ({ parent, params }) => {
  const { raceId } = params;
  const { racesForYear } = await parent();
  const races = racesForYear as Race[];

  const race = races.find((r) => r.id === parseInt(raceId));

  if (!race) {
    throw error(404, "Race not found");
  }

  return {
    race,
  };
};
