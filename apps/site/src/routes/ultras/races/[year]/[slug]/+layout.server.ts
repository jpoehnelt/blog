import { error } from "@sveltejs/kit";
import type { Race } from "$lib/types";

export const load = async ({ parent, params }) => {
  const { slug } = params;
  const { racesForYear } = await parent();
  const races = racesForYear as Race[];

  const race = races.find((r) => r.slug === slug);

  if (!race) {
    throw error(404, "Race not found");
  }

  return {
    race,
  };
};
