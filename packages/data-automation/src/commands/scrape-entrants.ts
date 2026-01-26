import axios from "axios";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import { DATA_DIR, ensureDataDir } from "../utils.js";
import { z } from "zod";

const EntrantSchema = z.object({
  rank: z.string().transform(v => {
      const n = parseFloat(v.replace("%", ""));
      return isNaN(n) ? 0 : n;
  }),
  ageRank: z.string().transform(v => {
      const n = parseFloat(v.replace("%", ""));
      return isNaN(n) ? 0 : n;
  }),
  results: z.preprocess((val) => Number(val), z.number().default(0)),
  target: z.string(),
  age: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  city: z.string(),
  state: z.string(),
  bib: z.string(),
  finishes: z.preprocess((val) => Number(val), z.number().default(0)),
});

type Entrant = z.infer<typeof EntrantSchema>;

interface ScrapeEntrantsOptions {
  did: number;
  output: string;
}

export async function scrapeEntrants(options: ScrapeEntrantsOptions) {
  const url = `https://ultrasignup.com/entrants_event.aspx?did=${options.did}`;
  const dataFile = path.join(DATA_DIR, options.output);

  ensureDataDir(dataFile);

  console.log(`Fetching ${url}...`);
  try {
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const dom = new JSDOM(response.data);
    const doc = dom.window.document;
    
    const rows = Array.from(doc.querySelectorAll("tr"));
    const entrants: Entrant[] = [];

    for (const row of rows) {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 8) continue;

        const texts = cells.map(c => c.textContent?.trim() || "");

        // Let's ensure we aren't parsing the header or filter row
        if (texts[0].toLowerCase().includes("rank") || texts[0] === "ALL" || texts[5].toLowerCase().includes("first")) continue;
        
        // Coerce via Zod
        const rawData = {
            rank: texts[0],
            ageRank: texts[1],
            results: texts[2],
            target: texts[3],
            age: texts[4],
            firstName: texts[6],
            lastName: texts[7],
            city: texts[8],
            state: texts[9],
            bib: texts[10],
            finishes: texts[11]
        };

        const result = EntrantSchema.safeParse(rawData);
        if (result.success) {
             if (result.data.firstName || result.data.lastName) {
                entrants.push(result.data);
             }
        } else {
            console.warn(`Failed to parse row: ${JSON.stringify(rawData)}`, result.error);
        }
    }

    console.log(`Found ${entrants.length} entrants.`);

    ensureDataDir();

    fs.writeFileSync(dataFile, JSON.stringify(entrants, null, 2));
    console.log(`Saved entrants to ${dataFile}`);

  } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to scrape entrants: ${message}`);
  }
}

export const command = "scrape-entrants";
export const describe = "Scrape entrants for a single race";
export const builder = {
  did: {
    alias: "d",
    type: "number",
    demandOption: true,
    description: "UltraSignup Event ID",
  },
  output: {
    alias: "o",
    type: "string",
    demandOption: true,
    description: "Output JSON filename",
  },
} as const;
export const handler = async (argv: any) => {
  await scrapeEntrants(argv);
};
