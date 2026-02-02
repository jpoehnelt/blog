#!/usr/bin/env node
import dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// Load .env from monorepo root (override shell env vars)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../../.env");
const result = dotenv.config({ path: envPath, override: true });
if (result.error) {
  console.warn("Failed to load .env:", result.error.message);
}

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs/promises";
import pLimit from "p-limit";
import {
  enrichRace,
  enrichSeries,
  searchForSeriesMedia,
  analyzeMediaContent,
} from "./enrichment.js";
import type {
  Race,
  RaceEnrichment,
  RaceEnrichmentsFile,
  RaceSeriesEnrichment,
  RaceSeriesRegistry,
} from "./types.js";

const DATA_DIR = path.resolve(import.meta.dirname, "../../../data");
const RACES_DIR = path.join(DATA_DIR, "races");
const RACES_FILE = path.join(DATA_DIR, "races.json");
const ENRICHMENTS_FILE = path.join(DATA_DIR, "race-enrichments.json");
const SERIES_FILE = path.join(DATA_DIR, "series.json");

async function loadRaces(): Promise<Race[]> {
  const content = await fs.readFile(RACES_FILE, "utf-8");
  return JSON.parse(content);
}

async function loadEnrichments(): Promise<RaceEnrichmentsFile> {
  try {
    const content = await fs.readFile(ENRICHMENTS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveEnrichments(
  enrichments: RaceEnrichmentsFile,
): Promise<void> {
  await fs.writeFile(ENRICHMENTS_FILE, JSON.stringify(enrichments, null, 2));
}

yargs(hideBin(process.argv))
  .command(
    "enrich <id>",
    "Enrich a single race by ID",
    (yargs) => {
      return yargs
        .positional("id", {
          describe: "Race ID to enrich",
          type: "number",
          demandOption: true,
        })
        .option("force", {
          alias: "f",
          describe: "Force regeneration of summary/insights",
          type: "boolean",
          default: false,
        });
    },
    async (argv) => {
      const races = await loadRaces();
      const race = races.find((r) => r.id === argv.id);

      if (!race) {
        console.error(`Race ${argv.id} not found`);
        process.exit(1);
      }

      let existing: RaceEnrichment | undefined;
      const firstEvent = race.events?.[0];
      let enrichmentPath: string | undefined;

      if (firstEvent?.entrants?.dataFile) {
        const raceFolder = path.dirname(firstEvent.entrants.dataFile);
        enrichmentPath = path.join(DATA_DIR, raceFolder, "enrichment.json");

        try {
          const content = await fs.readFile(enrichmentPath, "utf-8");
          existing = JSON.parse(content);
          console.log(`Loaded existing enrichment from ${enrichmentPath}`);
        } catch {
          // No existing enrichment
        }
      }

      const enrichment = await enrichRace(race, {
        force: argv.force,
        existing,
      });
      console.log(JSON.stringify(enrichment, null, 2));

      if (enrichmentPath) {
        await fs.mkdir(path.dirname(enrichmentPath), { recursive: true });
        await fs.writeFile(enrichmentPath, JSON.stringify(enrichment, null, 2));
        console.log(`\nSaved to ${enrichmentPath}`);
      } else {
        const enrichments = await loadEnrichments();
        enrichments[String(race.id)] = enrichment;
        await saveEnrichments(enrichments);
        console.log(`\nSaved to ${ENRICHMENTS_FILE}`);
      }
    },
  )
  .command(
    "enrich-all",
    "Enrich all races without existing enrichment",
    (yargs) => {
      return yargs
        .option("delay", {
          describe: "Delay between races in ms",
          type: "number",
          default: 2000,
        })
        .option("limit", {
          describe: "Maximum number of races to enrich",
          type: "number",
        });
    },
    async (argv) => {
      const races = await loadRaces();
      const racesToEnrich: typeof races = [];

      for (const race of races) {
        const firstEvent = race.events?.[0];
        if (!firstEvent?.entrants?.dataFile) continue;

        const raceFolder = path.dirname(firstEvent.entrants.dataFile);
        const enrichmentPath = path.join(
          DATA_DIR,
          raceFolder,
          "enrichment.json",
        );

        try {
          await fs.access(enrichmentPath);
        } catch {
          racesToEnrich.push(race);
        }
      }

      console.log(`Found ${racesToEnrich.length} races without enrichment`);

      const limit = argv.limit ?? racesToEnrich.length;
      let enriched = 0;

      for (const race of racesToEnrich.slice(0, limit)) {
        try {
          const firstEvent = race.events?.[0];
          const raceFolder = path.dirname(firstEvent!.entrants!.dataFile);
          const enrichmentPath = path.join(
            DATA_DIR,
            raceFolder,
            "enrichment.json",
          );

          let existing: RaceEnrichment | undefined;
          try {
            const content = await fs.readFile(enrichmentPath, "utf-8");
            existing = JSON.parse(content);
          } catch {
            // No existing enrichment
          }

          const enrichment = await enrichRace(race, { existing });

          await fs.mkdir(path.dirname(enrichmentPath), { recursive: true });
          await fs.writeFile(
            enrichmentPath,
            JSON.stringify(enrichment, null, 2),
          );
          console.log(`✓ Saved ${enrichmentPath}\n`);
          enriched++;
        } catch (error) {
          console.error(`✗ Failed to enrich ${race.title}: ${error}`);
        }

        await new Promise((resolve) => setTimeout(resolve, argv.delay));
      }

      console.log(`\nDone. Enriched ${enriched} races.`);
    },
  )
  .command(
    "list",
    "List races and their enrichment status",
    () => {},
    async () => {
      const races = await loadRaces();
      const enrichments = await loadEnrichments();

      console.log("Race Enrichment Status\n");
      console.log("ID\t\tWebsite\tEnriched\tTitle");
      console.log("-".repeat(80));

      for (const race of races) {
        const hasWebsite = race.website ? "✓" : "-";
        const isEnriched = enrichments[String(race.id)] ? "✓" : "-";
        console.log(
          `${race.id}\t${hasWebsite}\t${isEnriched}\t\t${race.title}`,
        );
      }

      const withWebsites = races.filter((r) => r.website).length;
      const enriched = Object.keys(enrichments).length;
      console.log(
        `\nSummary: ${withWebsites}/${races.length} with websites, ${enriched} enriched`,
      );
    },
  )
  .command(
    "enrich-series <slug>",
    "Enrich a race series with shared content (derives title from races.json)",
    (yargs) => {
      return yargs
        .positional("slug", {
          type: "string",
          description: "Race slug (e.g., black-canyon-ultras)",
          demandOption: true,
        })
        .option("title", {
          type: "string",
          alias: "t",
          description: "Race title (auto-derived from races.json if omitted)",
        })
        .option("force", {
          type: "boolean",
          alias: "f",
          description: "Force regeneration of all content",
          default: false,
        });
    },
    async (argv) => {
      const { slug, force } = argv;
      let { title } = argv;

      // Auto-derive title from races.json if not provided
      if (!title) {
        const races = await loadRaces();
        const matchingRace = races.find((r) => {
          const raceSlug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return raceSlug === slug;
        });
        if (matchingRace) {
          title = matchingRace.title;
          console.log(`Derived title from races.json: "${title}"`);
        } else {
          console.error(`No race found with slug "${slug}". Provide --title.`);
          process.exit(1);
        }
      }

      // Ensure series directory exists
      const seriesDir = path.join(RACES_DIR, slug);
      await fs.mkdir(seriesDir, { recursive: true });

      // Load existing series enrichment
      const seriesPath = path.join(seriesDir, "series.json");
      let existing: RaceSeriesEnrichment | undefined;

      try {
        const content = await fs.readFile(seriesPath, "utf-8");
        existing = JSON.parse(content);
        console.log(`Loaded existing series enrichment from ${seriesPath}`);
      } catch {
        // No existing enrichment
      }

      const result = await enrichSeries(slug, title, { force, existing });

      // Save to series.json (enrichment)
      await fs.writeFile(seriesPath, JSON.stringify(result, null, 2));
      console.log(`\nSaved enrichment to ${seriesPath}`);

      // Auto-register in series registry if not present
      let registry: RaceSeriesRegistry = {};
      try {
        const content = await fs.readFile(SERIES_FILE, "utf-8");
        registry = JSON.parse(content);
      } catch {
        // No registry yet
      }

      if (!registry[slug]) {
        // Get all races that would match this slug
        const races = await loadRaces();
        const matchingRaces = races.filter((r) => {
          const raceSlug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return raceSlug === slug;
        });

        // Check for slug conflicts - different titles generating same slug
        const uniqueTitles = [...new Set(matchingRaces.map((r) => r.title))];
        if (uniqueTitles.length > 1) {
          console.warn(`\n⚠️  SLUG CONFLICT DETECTED!`);
          console.warn(`Multiple races generate slug "${slug}":`);
          for (const raceTitle of uniqueTitles) {
            const ids = matchingRaces
              .filter((r) => r.title === raceTitle)
              .map((r) => r.id);
            console.warn(`  - "${raceTitle}" (IDs: ${ids.join(", ")})`);
          }
          console.warn(`\nTo resolve, use a unique slug with --slug option.`);
          console.warn(
            `Example: pnpm enrich enrich-series my-unique-slug -t "Race Title"\n`,
          );
          process.exit(1);
        }

        // Check if this slug is already used for different race IDs
        const existingIds = Object.values(registry)
          .filter(
            (s): s is typeof s & { source: "ultrasignup" } =>
              s.source === "ultrasignup",
          )
          .flatMap((s) => s.ultrasignupIds);

        const newIds = matchingRaces.map((r) => r.id);
        const conflictingIds = newIds.filter((id) => existingIds.includes(id));

        if (conflictingIds.length > 0) {
          const existingSlug = Object.entries(registry).find(
            ([, s]) =>
              s.source === "ultrasignup" &&
              s.ultrasignupIds.some((id) => conflictingIds.includes(id)),
          )?.[0];
          console.warn(
            `\n⚠️  Race ID conflict! IDs ${conflictingIds.join(", ")} already registered under "${existingSlug}".`,
          );
          process.exit(1);
        }

        const ultrasignupIds = matchingRaces.map((r) => r.id);

        registry[slug] = {
          title,
          source: "ultrasignup",
          ultrasignupIds,
        };
        await fs.writeFile(SERIES_FILE, JSON.stringify(registry, null, 2));
        console.log(`Registered series "${slug}" in ${SERIES_FILE}`);
      }

      console.log(JSON.stringify(result, null, 2));
    },
  )
  .command(
    "series-list",
    "List all registered race series",
    () => {},
    async () => {
      let registry: RaceSeriesRegistry = {};
      try {
        const content = await fs.readFile(SERIES_FILE, "utf-8");
        registry = JSON.parse(content);
      } catch {
        console.log("No series registry found.");
        return;
      }

      console.log("Registered Race Series:\n");
      for (const [slug, series] of Object.entries(registry)) {
        const source =
          series.source === "ultrasignup"
            ? `UltraSignup (${series.ultrasignupIds.length} IDs)`
            : "External";
        console.log(`  ${slug}`);
        console.log(`    Title: ${series.title}`);
        console.log(`    Source: ${source}`);
        if (series.location) console.log(`    Location: ${series.location}`);
        if (series.events)
          console.log(`    Events: ${series.events.join(", ")}`);
        console.log();
      }

      console.log(`Total: ${Object.keys(registry).length} series`);
    },
  )
  .command(
    "enrich-all-series",
    "Enrich all races as series (batch operation)",
    (yargs) => {
      return yargs
        .option("skip-existing", {
          type: "boolean",
          alias: "s",
          description: "Skip races that already have series.json",
          default: true,
        })
        .option("append", {
          type: "boolean",
          alias: "a",
          description: "Append to existing data instead of overwriting",
          default: false,
        });
    },
    async (argv) => {
      const { skipExisting, limit, delay, upcoming, concurrency, append } =
        argv as unknown as {
          skipExisting: boolean;
          limit: number | undefined;
          delay: number;
          upcoming: boolean;
          concurrency: number;
          append: boolean;
        };
      let races = await loadRaces();

      if (upcoming) {
        const now = new Date();
        races = races.filter((r) => new Date(r.date) > now);
        console.log(`Filtered to ${races.length} upcoming races.`);
      }

      // Get unique slugs
      const slugMap = new Map<string, { title: string; ids: number[] }>();
      for (const race of races) {
        const slug = race.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const existing = slugMap.get(slug);
        if (existing) {
          existing.ids.push(race.id);
        } else {
          slugMap.set(slug, { title: race.title, ids: [race.id] });
        }
      }

      const slugs = Array.from(slugMap.keys());
      console.log(
        `Found ${slugs.length} unique race series from ${races.length} races\n`,
      );

      let enriched = 0;
      let skipped = 0;
      let errors = 0;
      let processedCount = 0;

      // Mutex for registry operations to prevent race conditions
      let registryLock = Promise.resolve();
      const updateRegistrySafely = (task: () => Promise<void>) => {
        const next = registryLock.then(() => task().catch(console.error));
        registryLock = next;
        return next;
      };

      const limiter = pLimit(concurrency);
      console.log(`Processing with concurrency: ${concurrency}`);

      const tasks = slugs.map((slug) =>
        limiter(async () => {
          if (limit && processedCount >= limit) {
            return;
          }

          // Check if series.json exists
          const seriesPath = path.join(RACES_DIR, slug, "series.json");
          let existingData: RaceSeriesEnrichment | undefined;

          try {
            const content = await fs.readFile(seriesPath, "utf-8");
            existingData = JSON.parse(content);

            if (skipExisting && !append) {
              console.log(`Skipping ${slug} (already enriched)`);
              skipped++;
              return;
            }
          } catch {
            // File doesn't exist, proceed
          }

          processedCount++;
          if (limit && processedCount > limit) return;

          const { title } = slugMap.get(slug)!;
          const index = processedCount;
          console.log(
            `\n[${index}/${limit || slugs.length}] Enriching: ${slug}${append && existingData ? " [APPEND]" : ""}`,
          );

          try {
            // Ensure directory exists
            await fs.mkdir(path.join(RACES_DIR, slug), { recursive: true });

            // Run enrichment
            const result = await enrichSeries(slug, title, {
              existing: append ? existingData : undefined,
            });
            await fs.writeFile(seriesPath, JSON.stringify(result, null, 2));
            console.log(`  ✓ Saved ${seriesPath}`);

            // Register in series registry (Serialized)
            await updateRegistrySafely(async () => {
              let registry: RaceSeriesRegistry = {};
              try {
                const content = await fs.readFile(SERIES_FILE, "utf-8");
                registry = JSON.parse(content);
              } catch {
                // No registry yet
              }

              if (!registry[slug]) {
                registry[slug] = {
                  title,
                  source: "ultrasignup",
                  ultrasignupIds: slugMap.get(slug)!.ids,
                };
                await fs.writeFile(
                  SERIES_FILE,
                  JSON.stringify(registry, null, 2),
                );
              }
            });

            enriched++;

            // Delay to avoid rate limits (applied per-thread)
            if (delay > 0) {
              await new Promise((r) => setTimeout(r, delay));
            }
          } catch (error) {
            console.error(`  ✗ Error processing ${slug}: ${error}`);
            errors++;
          }
        }),
      );

      await Promise.all(tasks);

      console.log(`\n=== Summary ===`);
      console.log(`Processed: ${processedCount}`);
      console.log(`Enriched: ${enriched}`);
      console.log(`Skipped: ${skipped}`);
      console.log(`Errors: ${errors}`);
    },
  )
  .command(
    "search-media <query>",
    "Search for media coverage and analyze quality",
    (yargs) => {
      return yargs.positional("query", {
        describe: "Race title or search query",
        type: "string",
      });
    },
    async (argv) => {
      const results = await searchForSeriesMedia(argv.query as string);
      console.log(JSON.stringify(results, null, 2));
    },
  )
  .command(
    "review-url <url> [title]",
    "Perform deep AI analysis on a specific URL",
    (yargs) => {
      return yargs
        .positional("url", { describe: "URL to analyze", type: "string" })
        .positional("title", {
          describe: "Race title (context)",
          type: "string",
          default: "Ultramarathon",
        });
    },
    async (argv) => {
      const result = await analyzeMediaContent(
        argv.url as string,
        argv.title as string,
      );
      if (result) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("No analysis results (low quality or failed to fetch).");
      }
    },
  )
  .demandCommand(1)
  .help()
  .parse();
