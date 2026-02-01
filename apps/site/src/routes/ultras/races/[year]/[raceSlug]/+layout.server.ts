import { error } from "@sveltejs/kit";
import type { Race } from "@jpoehnelt/ultrasignup-scraper/types";
import { promises as fs } from "fs";
import path from "path";

// Series enrichment type (shared across years)
interface RaceSeriesEnrichment {
  summary?: string;
  uniqueFeatures?: string[];
  courseInfo?: {
    elevation?: string;
    terrain?: string;
    aidStations?: number;
  };
  videos?: Array<{
    url: string;
    title: string;
    channelTitle?: string;
    publishedYear?: number;
  }>;
  media?: Array<{
    url: string;
    title: string;
    type: "news" | "podcast" | "article" | "interview";
    source?: string;
    summary?: string;
    years?: number[];
  }>;
}

// Year-specific enrichment type
interface RaceEnrichment {
  summary?: string;
  uniqueFeatures?: string[];
  gpx?: string;
  videos?: Array<{
    url: string;
    title: string;
    channelTitle?: string;
    publishedYear?: number;
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
    years?: number[];
  }>;
}

// Merged enrichment (series + year-specific)
type MergedEnrichment = RaceEnrichment & {
  courseInfo?: RaceSeriesEnrichment["courseInfo"];
};

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

  const dataRoot = path.join(process.cwd(), "../../data/races");

  // Load series enrichment (shared across years)
  let series: RaceSeriesEnrichment | null = null;
  try {
    const seriesPath = path.join(dataRoot, raceSlug, "series.json");
    const content = await fs.readFile(seriesPath, "utf-8");
    series = JSON.parse(content);
  } catch {
    // No series enrichment available
  }

  // Load year-specific enrichment
  let yearEnrichment: RaceEnrichment | null = null;
  try {
    const enrichmentPath = path.join(dataRoot, raceSlug, year, "enrichment.json");
    const content = await fs.readFile(enrichmentPath, "utf-8");
    yearEnrichment = JSON.parse(content);
  } catch {
    // No year-specific enrichment
  }

  // Merge: year-specific takes precedence, but merge videos/media arrays
  let enrichment: MergedEnrichment | null = null;
  
  if (series || yearEnrichment) {
    enrichment = {
      // Use year-specific summary if available, otherwise series
      summary: yearEnrichment?.summary ?? series?.summary,
      uniqueFeatures: yearEnrichment?.uniqueFeatures ?? series?.uniqueFeatures,
      courseInfo: series?.courseInfo,
      gpx: yearEnrichment?.gpx,
      videoInsights: yearEnrichment?.videoInsights,
      // Merge videos: year-specific first, then series (dedupe by URL)
      videos: mergeByUrl(yearEnrichment?.videos, series?.videos),
      // Merge media: year-specific first, then series (dedupe by URL)
      media: mergeByUrl(yearEnrichment?.media, series?.media),
    };
  }

  return {
    racesForSlug,
    enrichment,
  };
};

// Helper to merge arrays by URL, removing duplicates
function mergeByUrl<T extends { url: string }>(
  primary?: T[] | null,
  secondary?: T[] | null,
): T[] | undefined {
  if (!primary?.length && !secondary?.length) return undefined;
  
  const seen = new Set<string>();
  const result: T[] = [];
  
  for (const item of primary ?? []) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      result.push(item);
    }
  }
  
  for (const item of secondary ?? []) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      result.push(item);
    }
  }
  
  return result.length > 0 ? result : undefined;
}
