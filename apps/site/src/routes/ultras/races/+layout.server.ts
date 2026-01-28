import type { Race } from "$lib/types";
import { RaceSchema, type Race as ScraperRace } from "@jpoehnelt/ultrasignup-scraper/types";
import { slugify } from "$lib/utils";
import { z } from "zod";

export const load = async ({ fetch }) => {
  const response = await fetch("/data/races.json");
  const rawData = await response.json();
  const data = z.array(RaceSchema).parse(rawData);

  const races: Race[] = data.map((r: ScraperRace) => ({
    ...r,
    id: String(r.id),
    name: r.title,
    parentId: r.parentId,
    year: new Date(r.date).getFullYear().toString(),
    slug: slugify(r.title),
    events: r.events || [],
  }));

  return {
    races,
    years: [...new Set(races.map((r) => r.year))].sort().reverse(),
  };
};
