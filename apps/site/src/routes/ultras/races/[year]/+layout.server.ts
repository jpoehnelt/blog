import type { Race } from "@jpoehnelt/ultrasignup-scraper/types";

export const load = async ({ parent, params }) => {
  const { races } = await parent();
  return {
    racesForYear: races.filter(
      (r: Race) => new Date(r.date).getFullYear().toString() === params.year,
    ),
  };
};
