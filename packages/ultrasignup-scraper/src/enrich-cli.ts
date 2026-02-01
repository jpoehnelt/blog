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
import { enrichRace, enrichSeries } from "./enrichment.js";
import type { Race, RaceEnrichment, RaceEnrichmentsFile, RaceSeriesEnrichment, RaceSeriesRegistry } from "./types.js";

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
        // Get all UltraSignup IDs for this slug
        const races = await loadRaces();
        const matchingRaces = races.filter((r) => {
          const raceSlug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return raceSlug === slug;
        });
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
        const source = series.source === "ultrasignup" 
          ? `UltraSignup (${series.ultrasignupIds.length} IDs)`
          : "External";
        console.log(`  ${slug}`);
        console.log(`    Title: ${series.title}`);
        console.log(`    Source: ${source}`);
        if (series.location) console.log(`    Location: ${series.location}`);
        if (series.events) console.log(`    Events: ${series.events.join(", ")}`);
        console.log();
      }

      console.log(`Total: ${Object.keys(registry).length} series`);
    },
  )
  .demandCommand(1)
  .help()
  .parse();
