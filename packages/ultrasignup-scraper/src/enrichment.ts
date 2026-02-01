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
): Promise<Array<{ url: string; title: string; channelTitle?: string }>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("  No API key for YouTube search");
    return [];
  }

  try {
    // Step 1: Search YouTube directly for race videos
    const searchQuery = encodeURIComponent(`${race.title} ultramarathon race recap`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=10&order=relevance&key=${apiKey}`;
    
    console.log(`  Searching YouTube for "${race.title}"...`);
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      const errorBody = await searchResponse.text();
      console.warn(`  YouTube Search API error: ${searchResponse.status} - ${errorBody}`);
      return [];
    }

    const searchData = await searchResponse.json() as {
      items?: Array<{
        id: { videoId: string };
        snippet: { title: string; channelTitle: string };
      }>;
    };

    if (!searchData.items?.length) {
      console.log("  No videos found in search");
      return [];
    }

    // Step 2: Get full video details to check embeddable status
    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoIds}&key=${apiKey}`;
    
    const videosResponse = await fetch(videosUrl);
    if (!videosResponse.ok) {
      // Fall back to search results without validation
      console.warn("  Could not validate videos, using search results");
      return searchData.items.slice(0, 5).map((item) => ({
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
      }));
    }

    const videosData = await videosResponse.json() as {
      items?: Array<{
        id: string;
        snippet?: { title: string; channelTitle: string };
        status?: { privacyStatus: string; embeddable: boolean };
      }>;
    };

    if (!videosData.items?.length) {
      console.log("  No valid videos found");
      return [];
    }

    // Filter to public, embeddable videos
    const validated = videosData.items
      .filter((item) => 
        item.status?.privacyStatus === "public" && 
        item.status?.embeddable !== false
      )
      .map((item) => ({
        url: `https://www.youtube.com/watch?v=${item.id}`,
        title: item.snippet?.title || "Untitled",
        channelTitle: item.snippet?.channelTitle,
      }));

    console.log(`  Found ${validated.length} embeddable videos`);
    return validated.slice(0, 5);
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
