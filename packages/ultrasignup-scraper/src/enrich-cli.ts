#!/usr/bin/env node
import dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// Load .env from monorepo root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../../.env");
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.warn("Failed to load .env:", result.error.message);
}

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs/promises";
import { enrichRace } from "./enrichment.js";
import type { Race, RaceEnrichment, RaceEnrichmentsFile } from "./types.js";

const DATA_DIR = path.resolve(import.meta.dirname, "../../../data");
const RACES_FILE = path.join(DATA_DIR, "races.json");
const ENRICHMENTS_FILE = path.join(DATA_DIR, "race-enrichments.json");

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
  .demandCommand(1)
  .help()
  .parse();
