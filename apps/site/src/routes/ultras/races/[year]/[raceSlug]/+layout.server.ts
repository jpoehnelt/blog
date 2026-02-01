import { error } from "@sveltejs/kit";
import type { Race } from "@jpoehnelt/ultrasignup-scraper/types";
import { promises as fs } from "fs";
import path from "path";

// Enrichment type (subset of fields we need)
interface RaceEnrichment {
  summary?: string;
  uniqueFeatures?: string[];
  gpx?: string;
  videos?: Array<{
    url: string;
    title: string;
    channelTitle?: string;
    rank?: number;
    reason?: string;
  }>;
  videoInsights?: {
    challengingSections?: string[];
    proTips?: string[];
    courseHighlights?: string[];
    dnfRisks?: string[];
  };
  media?: Array<{
    url: string;
    title: string;
    type: "news" | "podcast" | "article" | "interview";
    source?: string;
    summary?: string;
  }>;
}

export const load = async ({ parent, params }) => {
  const { year, raceSlug } = params;
  const { racesForYear } = await parent();
  const races = racesForYear as Race[];

  // Find races matching this slug (could be multiple events for same race)
  const racesForSlug = races.filter((r) => {
    const slug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return slug === raceSlug;
  });

  if (racesForSlug.length === 0) {
    throw error(404, "Race not found");
  }

  // Load enrichment data from per-race folder
  let enrichment: RaceEnrichment | null = null;
  try {
    const enrichmentPath = path.join(
      process.cwd(),
      "../../data/races",
      year,
      raceSlug,
      "enrichment.json",
    );
    const content = await fs.readFile(enrichmentPath, "utf-8");
    enrichment = JSON.parse(content);
  } catch {
    // No enrichment data available
  }

  return {
    racesForSlug,
    enrichment,
  };
};
