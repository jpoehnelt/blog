import axios from "axios";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../../data");
const RACES_FILE = path.join(DATA_DIR, "races.json");

interface RaceConfig {
  id: string;
  year: string;
  date?: string; // ISO string YYYY-MM-DD
  slug: string;
  name: string;
  dataFile: string;
}

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("start", {
      type: "number",
      description: "Start ID to scan",
      default: 126941,
    })
    .option("end", {
      type: "number",
      description: "End ID to scan",
      default: 127000,
    })
    .help().argv;

  console.log(`Scanning for races from ID ${argv.start} to ${argv.end}...`);

  let races: RaceConfig[] = [];
  if (fs.existsSync(RACES_FILE)) {
    try {
      races = JSON.parse(fs.readFileSync(RACES_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading existing races config.", e);
    }
  }

  for (let id = argv.start; id <= argv.end; id++) {
    const url = `https://ultrasignup.com/event_waitlist.aspx?did=${id}`;
    try {
      // console.log(`Checking ${url}...`);
      const response = await axios.get(url, {
        validateStatus: () => true, // Make sure we handle 404s manually if needed
        maxRedirects: 2,
      });

      if (response.status !== 200) {
        continue;
      }

      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      // Check if it's a valid waitlist page
      const header1 = doc.querySelector("h1")?.textContent?.trim();
      const h2s = Array.from(doc.querySelectorAll("h2")).map(h => h.textContent?.trim());
      const isWaitlist = h2s.some(t => t === "Waitlist Applicants" || t?.includes("Waitlist Applicants"));

      if (!header1 || !isWaitlist) {
        continue;
      }
      
      // Extract Event Date
      let date = "";
      
      // Strategy 1: Look for common date classes
      const subHeader = doc.querySelector(".sub-header-text")?.textContent?.trim();
      const eventDateSpan = doc.querySelector(".event-date")?.textContent?.trim();
      
      // Strategy 2: Look for meta tags (OpenGraph)
      const ogDesc = doc.querySelector("meta[property='og:description']")?.getAttribute("content");
      
      // Strategy 3: Regex search on body (fallback)
      const bodyText = doc.body.textContent || "";
      
      const potentialDates = [subHeader, eventDateSpan, ogDesc, bodyText];
      
      for (const text of potentialDates) {
        if (!text) continue;
        
        // Match common date formats: May 4, 2026 or 05/04/2026 or Monday, May 4, 2026
        // Regex for Month DD, YYYY
        const fullDateMatch = text.match(/([A-Z][a-z]+ \d{1,2}, \d{4})/);
        if (fullDateMatch) {
            // Validate it's a date
            const d = new Date(fullDateMatch[0]);
            if (!isNaN(d.getTime())) {
                date = d.toISOString().split("T")[0]; // YYYY-MM-DD
                break;
            }
        }
      }
      
      // Fallback: If no full date found, try to find year at least
      let year = new Date().getFullYear().toString();
      if (date) {
          year = date.split("-")[0];
      } else if (subHeader) {
           const yearMatch = subHeader.match(/\d{4}/);
           if (yearMatch) year = yearMatch[0];
      }

      const name = header1;
      const slug = slugify(name);
      
      // Check if already exists
      if (races.find(r => r.id === id.toString())) {
        console.log(`Race ${name} (${id}) already exists. Skipped.`);
        continue;
      }

      const existingConfig = races.find(r => r.slug === slug && r.year === year);
       if (existingConfig) {
           console.log(`Race ${name} (${year}) already exists with different ID? Skipped.`);
           continue;
       }

      console.log(`Found NEW race: ${name} (${year}) - ID: ${id}`);
      
      const newRace: RaceConfig = {
        id: id.toString(),
        year,
        date,
        slug,
        name,
        dataFile: `${slug}-${year}-waitlist.json`,
      };

      races.push(newRace);

    } catch (err) {
      console.error(`Failed to fetch ${url}`, err.message);
    }
    
    // Polite delay
    await new Promise(r => setTimeout(r, 500));
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(RACES_FILE, JSON.stringify(races, null, 2));
  console.log(`Updated ${RACES_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
