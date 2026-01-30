import {
  RaceSchema,
  type Race,
} from "@jpoehnelt/ultrasignup-scraper/types";
import { z } from "zod";

export const load = async ({ fetch }) => {
  const response = await fetch("/data/races.json");
  const rawData = await response.json();
  const races = z.array(RaceSchema).parse(rawData);

  return {
    races,
    years: [...new Set(races.map((r: Race) => r.year))].sort().reverse(),
  };
};
