import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { JSDOM } from "jsdom";
import pLimit from "p-limit";
import type { Race, RaceEnrichment, RaceSeriesEnrichment } from "./types.js";

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

const ContentAnalysisSchema = z.object({
  qualityScore: z.number().min(1).max(10).describe("Quality score 1-10 based on depth, authority, and editorial value"),
  summary: z.string().describe("Summary of the actual content"),
  tags: z.array(z.enum(["Report", "Preview", "Other"])).describe("Content tags. Use 'Report' for race reports/results, 'Preview' for guides/previews. Everything else is 'Other'."),
  racers: z.array(z.object({ firstName: z.string(), lastName: z.string() })).default([]).describe("Racers mentioned in the content"),
  category: z.enum(["news", "podcast", "article", "interview"]).describe("Refined category based on content"),
});

export async function analyzeMediaContent(url: string, title?: string): Promise<z.infer<typeof ContentAnalysisSchema> | null> {
  const google = getGoogle();

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();
    const dom = new JSDOM(html);
    
    // Simple text extraction
    const content = dom.window.document.body.textContent?.slice(0, 15000) || "";
    
    const { output } = await generateText({
      model: google(MODEL),
      output: Output.object({ schema: ContentAnalysisSchema }),
      prompt: `Analyze this content for the race "${title || "Unknown"}".
      
      URL: ${url}
      Content Snippet: ${content}

      Tasks:
      1. Assign a Quality Score (1-10). High scores (8-10) for deep, specific coverage (interviews, detailed race reports). Low scores (1-4) for generic aggregators, brief mentions, or automated listings.
      2. Tag the content: "Report", "Preview", or "Other".
      3. Extract mentioned racers (First Last).
      4. Summarize the content in 1 sentence.

      CRITICAL FILTERS:
      - If this is a generic listicle (e.g. "Best Half Marathons in National Parks") where the race is just one item among many, assign Quality Score < 3.
      - If this is a registry page or automated calendar, assign Quality Score 1.
      `,
    });

    return output;
  } catch (error) {
    console.warn(`    Analysis failed for ${url}: ${error}`);
    return null;
  }
}


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
        years: z.array(z.number()).optional().describe("Year(s) the content covers (e.g., [2024] or [2023, 2024])"),
      }),
    )
    .describe("Media coverage about the race"),
});

// --- Utilities ---

const BLOCKED_DOMAINS = [
  "mybestruns.com",
  "ahotu.com",
  "runguides.com",
  "runningintheusa.com",
  "ultrasignup.com",
  "eventbrite.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "pinterest.com",
];

async function validateUrl(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    if (BLOCKED_DOMAINS.some((d) => parsed.hostname.includes(d))) {
      console.log(`  Skipping blocked domain: ${parsed.hostname}`);
      return false;
    }

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
): Promise<Array<{ url: string; title: string; channelTitle?: string; publishedYear?: number }>> {
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
        snippet?: { title: string; channelTitle: string; publishedAt?: string };
        status?: { privacyStatus: string; embeddable: boolean };
      }>;
    };

    if (!videosData.items?.length) {
      console.log("  No valid videos found");
      return [];
    }

    // Filter to public, embeddable videos
    const candidates = videosData.items
      .filter((item) => {
        if (item.status?.privacyStatus !== "public" || item.status?.embeddable === false) return false;
        
        const videoTitle = item.snippet?.title?.toLowerCase() || "";
        const raceToken = race.title.toLowerCase().split(' ')[0];
        
        // Strict relevance check
        if (!videoTitle.includes(raceToken)) return false;
        
        return true;
      })
      .map((item) => {
        const publishedYear = item.snippet?.publishedAt 
          ? new Date(item.snippet.publishedAt).getFullYear() 
          : undefined;
        return {
          url: `https://www.youtube.com/watch?v=${item.id}`,
          title: item.snippet?.title || "Untitled",
          channelTitle: item.snippet?.channelTitle,
          publishedYear,
        };
      });

    console.log(`  Found ${candidates.length} candidates, validating with AI...`);
    
    const limit = pLimit(3);
    const validatedPromises = candidates.map((video) => 
      limit(async () => {
        const isRelevant = await validateVideoRelevance(video, race.title);
        return isRelevant ? video : null;
      })
    );
    
    const validated = (await Promise.all(validatedPromises)).filter((v): v is NonNullable<typeof v> => v !== null);

    console.log(`  Found ${validated.length} validated videos`);
    return validated.slice(0, 5);
  } catch (error) {
    console.warn(`  Video search failed: ${error}`);
    return [];
  }
}

async function validateVideoRelevance(
  video: { title: string; channelTitle?: string; description?: string },
  raceTitle: string,
): Promise<boolean> {
  const google = getGoogle();
  
  try {
    const { output } = await generateText({
      model: google(MODEL),
      prompt: `Task: Determine if the following YouTube video is SPECIFICALLY about the "${raceTitle}" race.
      
      Video Title: "${video.title}"
      Channel: "${video.channelTitle || "Unknown"}"
      
      Rules:
      1. Return "true" only if the video is clearly about this specific race/event (recaps, course previews, race reports).
      2. Return "false" for generic advice (e.g., "How to run your first 50k"), unrelated races, or vlog entries that don't mention the race in the title/context.
      3. Be strict. If ambiguous, reject.
      
      Answer (true/false):`,
    });

    return output.trim().toLowerCase().includes("true");
  } catch (error) {
    console.warn(`  Video validation failed: ${error}`);
    // Fail closed on error to be safe
    return false;
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
      prompt: `Search for high-quality editorial media coverage about the "${race.title}" ultramarathon. Find news articles, podcasts, and interviews. Exclude directories, automated race calendars (like mybestruns, ahotu), and content farms. Exclude YouTube and social media. For each item, include the year(s) it covers.`,
    });

    if (!output?.media?.length) return [];

    console.log(`  Validating ${output.media.length} media URLs...`);
    const validated = [];

    for (const item of output.media) {
      if (await validateUrl(item.url)) {
        // Step 2: Deep analysis
        const analysis = await analyzeMediaContent(item.url, item.title);
        
        if (analysis && analysis.qualityScore >= 6) {
          validated.push({
            ...item,
            type: analysis.category,
            contentSummary: analysis.summary,
            qualityScore: analysis.qualityScore,
            tags: analysis.tags,
            racers: analysis.racers,
          });
          console.log(`    ✓ [Score: ${analysis.qualityScore}] ${item.title}`);
        } else {
          console.log(`    ✗ [Score: ${analysis?.qualityScore ?? "N/A"}] Low quality/failed: ${item.title}`);
        }
      } else {
        console.log(`  Skipping invalid/blocked: ${item.url}`);
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

// --- Series Enrichment ---

export interface EnrichSeriesOptions {
  force?: boolean;
  existing?: RaceSeriesEnrichment;
}

/**
 * Enrich a race series with AI-generated content shared across years.
 * This generates evergreen content like course info, general videos, etc.
 */
export async function enrichSeries(
  slug: string,
  raceTitle: string,
  options: EnrichSeriesOptions = {},
): Promise<RaceSeriesEnrichment> {
  const { force = false, existing } = options;

  console.log(`Enriching series: ${slug}${force ? " [FORCE]" : ""}`);

  const enrichment: RaceSeriesEnrichment = {
    slug,
    lastUpdated: new Date().toISOString(),
  };

  // Summary (regenerate-able)
  const hasSummary = existing?.summary && existing?.uniqueFeatures;

  if (!hasSummary || force) {
    console.log("  Generating series summary...");
    // Create a minimal race object for the summary function
    const result = await generateSummary({ title: raceTitle } as Race);
    if (result) {
      enrichment.summary = result.summary;
      enrichment.uniqueFeatures = result.uniqueFeatures;
    }
  } else {
    console.log("  Keeping existing summary");
    enrichment.summary = existing?.summary;
    enrichment.uniqueFeatures = existing?.uniqueFeatures;
  }

  // Videos (append-only) - search for general/course videos
  console.log("  Searching for series videos...");
  const newVideos = await searchForSeriesVideos(raceTitle, existing?.videos || []);
  const allVideos = mergeByUrl(existing?.videos, newVideos);

  if (allVideos.length > 0) {
    enrichment.videos = allVideos;
    const newCount = allVideos.length - (existing?.videos?.length || 0);
    console.log(
      `  Videos: ${newVideos.length} found, ${newCount} new, ${allVideos.length} total`,
    );
  }

  // Media (append-only) - search for evergreen articles
  console.log("  Searching for series media...");
  const newMedia = await searchForSeriesMedia(raceTitle);
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

async function searchForSeriesVideos(
  raceTitle: string,
  existingVideos: Array<any> = []
): Promise<Array<{ url: string; title: string; channelTitle?: string; publishedYear?: number; viewCount?: number }>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  // Determine filtering strictness
  const strictMode = existingVideos.length >= 5;
  const minViews = strictMode ? 1000 : 100;
  const maxAgeYears = strictMode ? 4 : 10;
  const currentYear = new Date().getFullYear();

  try {
    // Search for course guides and general race videos (not specific year recaps)
    const searchQuery = encodeURIComponent(`${raceTitle} ultramarathon course guide preview`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=15&order=relevance&key=${apiKey}`;

    console.log(`  Searching YouTube for series content...`);
    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) return [];

    const searchData = await searchResponse.json() as {
      items?: Array<{
        id: { videoId: string };
        snippet: { title: string; channelTitle: string; publishedAt?: string };
      }>;
    };

    if (!searchData.items?.length) return [];

    // Get full video details (including statistics for viewCount)
    const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status,statistics&id=${videoIds}&key=${apiKey}`;

    const videosResponse = await fetch(videosUrl);
    if (!videosResponse.ok) return [];

    const videosData = await videosResponse.json() as {
      items?: Array<{
        id: string;
        snippet?: { title: string; channelTitle: string; publishedAt?: string };
        status?: { privacyStatus: string; embeddable: boolean };
        statistics?: { viewCount: string };
      }>;
    };

    if (!videosData.items?.length) return [];

    // Step 1: Basic Filtering & Strict Token Check
    const candidates = videosData.items
      .filter((item) => {
        if (item.status?.privacyStatus !== "public" || item.status?.embeddable === false) return false;
        
        const viewCount = parseInt(item.statistics?.viewCount || "0", 10);
        const publishedYear = item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).getFullYear() : currentYear;
        const age = currentYear - publishedYear;
        const videoTitle = item.snippet?.title?.toLowerCase() || "";
        const raceToken = raceTitle.toLowerCase().split(' ')[0]; // E.g., "mill" from "Mill Stone"
        
        // Strict relevance check: Title must contain at least the first significant word of the race name
        if (!videoTitle.includes(raceToken)) return false;

        // Apply dynamic filters
        if (viewCount < minViews) return false;
        if (age > maxAgeYears) return false;

        return true;
      })
      .map((item) => ({
        url: `https://www.youtube.com/watch?v=${item.id}`,
        title: item.snippet?.title || "Untitled",
        channelTitle: item.snippet?.channelTitle,
        publishedYear: item.snippet?.publishedAt
          ? new Date(item.snippet.publishedAt).getFullYear()
          : undefined,
        viewCount: parseInt(item.statistics?.viewCount || "0", 10),
      }));
      
    // Step 2: AI Validation for remaining candidates
    console.log(`  Validating ${candidates.length} video candidates with AI...`);
    const limit = pLimit(3);
    
    const validatedPromises = candidates.map((video) => 
      limit(async () => {
        const isRelevant = await validateVideoRelevance(video, raceTitle);
        if (isRelevant) {
             console.log(`    ✓ [AI Valid] ${video.title}`);
             return video;
        } else {
             console.log(`    ✗ [AI Invalid] ${video.title}`);
             return null;
        }
      })
    );
    
    const validated = (await Promise.all(validatedPromises)).filter((v): v is NonNullable<typeof v> => v !== null);

    return validated.slice(0, 5);
  } catch (error) {
    console.warn(`  Series video search failed: ${error}`);
    return [];
  }
}

async function searchForSeriesMedia(raceTitle: string, existingMedia: Array<{ url: string; title: string }> = []) {
  const google = getGoogle();

  // Create exclusion context
  const excludeContext = existingMedia.length > 0
    ? `\nExclude these already known articles:\n${existingMedia.map(m => `- ${m.title} (${m.url})`).join("\n")}`
    : "";

  try {
    const { output } = await generateText({
      model: google(MODEL),
      output: Output.object({ schema: MediaSearchSchema }),
      tools: { google_search: google.tools.googleSearch({}) },
      prompt: `Search for high-quality, evergreen editorial media coverage about the "${raceTitle}" ultramarathon. Find course guides, race profiles, and timeless articles from reputable sources (e.g. iRunFar, Trail Runner Mag). Exclude directories, automated calendars, and AI-generated aggregators. Exclude year-specific results/recaps. Exclude weekly news roundups (e.g. "This Week in Running").${excludeContext}`,
    });

    console.log(`  AI Media Search result: ${output?.media?.length || 0} items found`);
    if (output?.media) {
      console.log(`  Initial AI summaries:`, output.media.map(m => `[${m.source}] ${m.title}`).join(", "));
    }

    if (!output?.media?.length) return [];

    console.log(`  Validating ${output.media.length} media URLs (Parallel: 3)...`);
    
    // Concurrency limit
    const limit = pLimit(3);

    const validationPromises = output.media.map((item) => 
      limit(async () => {
        if (await validateUrl(item.url)) {
          // Step 2: Deep analysis
          const analysis = await analyzeMediaContent(item.url, item.title);
          
          if (analysis && analysis.qualityScore >= 6) {
            console.log(`    ✓ [Score: ${analysis.qualityScore}] ${item.title}`);
            return {
              ...item,
              type: analysis.category,
              contentSummary: analysis.summary,
              qualityScore: analysis.qualityScore,
              tags: analysis.tags,
              racers: analysis.racers,
            };
          } else {
            console.log(`    ✗ [Score: ${analysis?.qualityScore ?? "N/A"}] Rejected (Low quality or analysis failed): ${item.title}`);
            return null;
          }
        } else {
          console.log(`  Skipping invalid/blocked: ${item.url}`);
          return null;
        }
      })
    );

    const results = await Promise.all(validationPromises);
    const validated = results.filter((item): item is NonNullable<typeof item> => item !== null);

    return validated;
  } catch (error) {
    console.warn(`  Media search failed: ${error}`);
    return [];
  }
}

export {
  searchForSeriesMedia,
  validateVideoRelevance,
};



export {
  RaceEnrichmentSchema,
  RaceSeriesEnrichmentSchema,
  type RaceEnrichment,
  type RaceSeriesEnrichment,
} from "./types.js";
