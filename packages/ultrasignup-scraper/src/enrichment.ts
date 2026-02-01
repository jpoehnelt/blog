import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { Race, RaceEnrichment } from "./types.js";

// --- AI Provider ---

let _google: ReturnType<typeof createGoogleGenerativeAI> | null = null;

function getGoogle() {
  if (!_google) {
    _google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return _google;
}

const MODEL = "gemini-3-flash-preview";

// --- Schemas ---

const SummarySchema = z.object({
  summary: z.string().describe("2-3 sentence engaging summary of the race"),
  uniqueFeatures: z
    .array(z.string())
    .describe("Top 3 unique features of this race"),
});

const VideoSearchSchema = z.object({
  videos: z
    .array(
      z.object({
        url: z.string().describe("Full YouTube video URL"),
        title: z.string().describe("Video title"),
      }),
    )
    .describe("YouTube videos about the race"),
});

const VideoInsightsSchema = z.object({
  challengingSections: z
    .array(z.string())
    .describe("Top 3-5 challenging sections"),
  proTips: z
    .array(z.string())
    .describe("Top 5-8 gear, pacing, or nutrition tips"),
  courseHighlights: z.array(z.string()).describe("Top 3-5 scenic highlights"),
  dnfRisks: z.array(z.string()).describe("Top 3-5 common DNF reasons"),
});

const MediaSearchSchema = z.object({
  media: z
    .array(
      z.object({
        url: z.string().describe("URL to the content"),
        title: z.string().describe("Title"),
        type: z
          .enum(["news", "podcast", "article", "interview"])
          .describe("Media type"),
        source: z.string().describe("Publication or podcast name"),
        summary: z.string().describe("1-2 sentence summary"),
      }),
    )
    .describe("Media coverage about the race"),
});

// --- Utilities ---

async function validateUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RaceEnrichmentBot/1.0)",
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export function mergeByUrl<T extends { url: string }>(
  existing: T[] | undefined,
  newItems: T[],
): T[] {
  const urls = new Set(existing?.map((item) => item.url) || []);
  const merged = [...(existing || [])];

  for (const item of newItems) {
    if (!urls.has(item.url)) {
      merged.push(item);
      urls.add(item.url);
    }
  }

  return merged;
}

// --- AI Functions ---

async function generateSummary(race: Race) {
  const google = getGoogle();
  const websiteContext = race.website
    ? `\nOfficial website: ${race.website}`
    : "";

  try {
    const { output } = await generateText({
      model: google(MODEL),
      output: Output.object({ schema: SummarySchema }),
      tools: { google_search: google.tools.googleSearch({}) },
      prompt: `Research the ultramarathon "${race.title}" in ${race.location}.${websiteContext}\n\nProvide an engaging summary and unique features. Be specific and factual.`,
    });
    return output;
  } catch (error) {
    console.error(`  Summary generation failed: ${error}`);
    return null;
  }
}

async function searchForVideos(
  race: Race,
): Promise<Array<{ url: string; title: string }>> {
  const google = getGoogle();

  try {
    const { output } = await generateText({
      model: google(MODEL),
      output: Output.object({ schema: VideoSearchSchema }),
      tools: { google_search: google.tools.googleSearch({}) },
      prompt: `Find the 5 most popular YouTube race recap or course preview videos for the ultramarathon "${race.title}".`,
    });

    if (!output?.videos?.length) return [];

    const seen = new Set<string>();
    const candidates = output.videos.filter((v) => {
      if (!v.url.includes("youtube.com") && !v.url.includes("youtu.be"))
        return false;
      if (seen.has(v.url)) return false;
      seen.add(v.url);
      return true;
    });

    console.log(`  Validating ${candidates.length} video URLs...`);
    const validated: Array<{ url: string; title: string }> = [];

    for (const video of candidates) {
      if (await validateUrl(video.url)) {
        validated.push(video);
        if (validated.length >= 5) break;
      } else {
        console.log(`  Skipping invalid video: ${video.url}`);
      }
    }

    return validated;
  } catch (error) {
    console.warn(`  Video search failed: ${error}`);
    return [];
  }
}

async function analyzeVideos(videoUrls: string[], raceTitle: string) {
  if (!videoUrls.length) return null;

  const google = getGoogle();
  const videosPrompt = videoUrls.map((url, i) => `${i + 1}. ${url}`).join("\n");

  try {
    const { output } = await generateText({
      model: google(MODEL),
      output: Output.object({ schema: VideoInsightsSchema }),
      prompt: `Analyze these YouTube videos about the "${raceTitle}" ultramarathon:\n\n${videosPrompt}\n\nExtract and deduplicate insights. Be specific - only include facts mentioned in the videos.`,
    });
    return output;
  } catch (error) {
    console.warn(`  Video analysis failed: ${error}`);
    return null;
  }
}

async function searchForMedia(race: Race) {
  const google = getGoogle();

  try {
    const { output } = await generateText({
      model: google(MODEL),
      output: Output.object({ schema: MediaSearchSchema }),
      tools: { google_search: google.tools.googleSearch({}) },
      prompt: `Search for media coverage about the "${race.title}" ultramarathon. Find news articles, podcasts, and interviews. Exclude YouTube and social media.`,
    });

    if (!output?.media?.length) return [];

    console.log(`  Validating ${output.media.length} media URLs...`);
    const validated = [];

    for (const item of output.media) {
      if (await validateUrl(item.url)) {
        validated.push(item);
      } else {
        console.log(`  Skipping invalid media: ${item.url}`);
      }
    }

    return validated;
  } catch (error) {
    console.warn(`  Media search failed: ${error}`);
    return [];
  }
}

// --- Main Export ---

export interface EnrichOptions {
  /** Force regeneration of summary/insights even if present */
  force?: boolean;
  /** Existing enrichment to merge with (for append-only fields) */
  existing?: RaceEnrichment;
}

/**
 * Enrich a race with AI-generated content.
 *
 * - `videos[]` and `media[]` are append-only (merged with existing)
 * - `summary`, `uniqueFeatures`, `videoInsights` skip if present (use `force` to regenerate)
 */
export async function enrichRace(
  race: Race,
  options: EnrichOptions = {},
): Promise<RaceEnrichment> {
  const { force = false, existing } = options;

  console.log(
    `Enriching: ${race.title} (${race.id})${force ? " [FORCE]" : ""}`,
  );

  const enrichment: RaceEnrichment = {
    raceId: race.id,
    lastUpdated: new Date().toISOString(),
  };

  // Summary (regenerate-able)
  const hasSummary = existing?.summary && existing?.uniqueFeatures;

  if (!hasSummary || force) {
    console.log("  Generating summary...");
    const result = await generateSummary(race);
    if (result) {
      enrichment.summary = result.summary;
      enrichment.uniqueFeatures = result.uniqueFeatures;
    }
  } else {
    console.log("  Skipping summary (use --force to regenerate)");
    enrichment.summary = existing.summary;
    enrichment.uniqueFeatures = existing.uniqueFeatures;
  }

  // Videos (append-only)
  console.log("  Searching for videos...");
  const newVideos = await searchForVideos(race);
  const allVideos = mergeByUrl(existing?.videos, newVideos);

  if (allVideos.length > 0) {
    enrichment.videos = allVideos;
    const newCount = allVideos.length - (existing?.videos?.length || 0);
    console.log(
      `  Videos: ${newVideos.length} found, ${newCount} new, ${allVideos.length} total`,
    );

    const needsInsights = newCount > 0 || force || !existing?.videoInsights;

    if (needsInsights) {
      console.log("  Analyzing videos...");
      const insights = await analyzeVideos(
        allVideos.slice(0, 5).map((v) => v.url),
        race.title,
      );
      if (insights) {
        enrichment.videoInsights = {
          challengingSections: insights.challengingSections?.length
            ? insights.challengingSections
            : undefined,
          proTips: insights.proTips?.length ? insights.proTips : undefined,
          courseHighlights: insights.courseHighlights?.length
            ? insights.courseHighlights
            : undefined,
          dnfRisks: insights.dnfRisks?.length ? insights.dnfRisks : undefined,
        };
      }
    } else {
      console.log("  Keeping existing video insights");
      enrichment.videoInsights = existing?.videoInsights;
    }
  }

  // Media (append-only)
  console.log("  Searching for media...");
  const newMedia = await searchForMedia(race);
  const allMedia = mergeByUrl(existing?.media, newMedia);

  if (allMedia.length > 0) {
    enrichment.media = allMedia;
    const newCount = allMedia.length - (existing?.media?.length || 0);
    console.log(
      `  Media: ${newMedia.length} found, ${newCount} new, ${allMedia.length} total`,
    );
  }

  return enrichment;
}

export { RaceEnrichmentSchema, type RaceEnrichment } from "./types.js";
