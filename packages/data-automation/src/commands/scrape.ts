import axios from "axios";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import { DATA_DIR, ensureDataDir } from "../utils.js";

interface WaitlistEntry {
  date: string;
  count: number;
  applicants: string[];
}

interface ScrapeOptions {
  did: number;
  output: string;
}

export async function scrape(options: ScrapeOptions) {
  const url = `https://ultrasignup.com/event_waitlist.aspx?did=${options.did}`;
  const dataFile = path.join(DATA_DIR, options.output);

  ensureDataDir(dataFile);

  console.log(`Fetching ${url}...`);
  const response = await axios.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const dom = new JSDOM(response.data);
  const doc = dom.window.document;

  const applicants: string[] = [];
  const links = doc.querySelectorAll("a[href*='results_participant.aspx']");
  
  links.forEach((link) => {
    if (link.textContent) {
        applicants.push(link.textContent.trim());
    }
  });

  console.log(`Found ${applicants.length} applicants.`);

  let history: WaitlistEntry[] = [];
  if (fs.existsSync(dataFile)) {
    try {
      history = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    } catch (e) {
      console.error("Error reading existing data, starting fresh.", e);
    }
  }

  const today = new Date().toISOString().split("T")[0];
  
  history = history.filter((entry) => entry.date !== today);

  if (history.length === 0 && applicants.length === 0) {
      console.log("No applicants found and no previous history. Skipping file creation.");
      return;
  }

  history.push({
    date: today,
    count: applicants.length,
    applicants: applicants,
  });

  history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  ensureDataDir();

  fs.writeFileSync(dataFile, JSON.stringify(history, null, 2));
  console.log(`Saved data to ${dataFile}`);
}

export const command = "scrape";
export const describe = "Scrape waitlist for a single race";
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
  await scrape(argv);
};
