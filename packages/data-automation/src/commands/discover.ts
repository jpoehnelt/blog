import axios from "axios";
import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import { DATA_DIR } from "../utils.js";

const RACES_FILE = path.join(DATA_DIR, "races.json");

interface WaitlistInfo {
    dataFile: string;
}

interface EventConfig {
  id: string;
  title: string;
  waitlist?: WaitlistInfo;
  entrants?: WaitlistInfo;
}

interface RaceConfig {
  id: string;
  year: string;
  date?: string;
  slug: string;
  name: string;
  location?: string;
  dataFile?: string;
  events?: EventConfig[];
}

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

interface DiscoverOptions {
  start: number;
  end: number;
}

export async function discover(argv: DiscoverOptions) {
  console.log(`Scanning for races from ID ${argv.start} to ${argv.end}... (Version 2)`);

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
      const response = await axios.get(url, {
        validateStatus: () => true,
        maxRedirects: 2,
      });

      if (response.status !== 200) {
        continue;
      }

      const dom = new JSDOM(response.data);
      const doc = dom.window.document;

      const header1 = doc.querySelector("h1")?.textContent?.trim();
      const h2s = Array.from(doc.querySelectorAll("h2")).map(h => h.textContent?.trim());
      const isWaitlist = h2s.some(t => t === "Waitlist Applicants" || t?.includes("Waitlist Applicants"));

      if (!header1 || !isWaitlist) {
        continue;
      }
      
      let date = "";
      const subHeader = doc.querySelector(".sub-header-text")?.textContent?.trim();
      const eventDateSpan = doc.querySelector(".event-date")?.textContent?.trim();
      const ogDesc = doc.querySelector("meta[property='og:description']")?.getAttribute("content");
      const bodyText = doc.body.textContent || "";
      
      const potentialDates = [subHeader, eventDateSpan, ogDesc, bodyText];
      
      for (const text of potentialDates) {
        if (!text) continue;
        const fullDateMatch = text.match(/([A-Z][a-z]+ \d{1,2}, \d{4})/);
        if (fullDateMatch) {
            const d = new Date(fullDateMatch[0]);
            if (!isNaN(d.getTime())) {
                date = d.toISOString().split("T")[0];
                break;
            }
        }
      }
      
      let year = new Date().getFullYear().toString();
      if (date) {
          year = date.split("-")[0];
      } else if (subHeader) {
           const yearMatch = subHeader.match(/\d{4}/);
           if (yearMatch) year = yearMatch[0];
      }

      const name = header1;
      const slug = slugify(name);
      
      const exists = races.some(r => {
          if (r.id === id.toString()) return true;
          if (r.events?.some(e => e.id === id.toString())) return true;
          return false;
      });

      if (exists) {
        console.log(`Race ${name} (${id}) already exists. Skipped.`);
        continue;
      }

      let location = "";
      
      // UltraSignup often puts location in a specific span or div, typically class "event-location" or just text in headers.
      // Another common pattern is text like "Auburn, CA".
      // Let's look for the specific "city-state" class often used
      const cityState = doc.querySelector(".city-state")?.textContent?.trim();
      if (cityState) {
          location = cityState;
      } else {
        // Fallback: try to find it in the sub-header
        if (subHeader) {
            // "May 4, 2026 • 250 Mile • 125 Mile • Eldorado • Sedona, AZ"
             // Split by bullet point (•), pipe (|), or just handle the raw string if split fails
             // Note: The bullet might be different codes.
             const parts = subHeader.split(/[\u2022\u00B7|]|\s-\s/).map(s => s.trim());
             
             // Filter out parts that look like dates
             const candidateParts = parts.filter(p => {
                 const isDate = !isNaN(Date.parse(p)) || /\d{4}/.test(p); // rudimentary date check
                 return !isDate && p.includes(",");
             });

             if (candidateParts.length > 0) {
                 // Take the last one that looks like a location
                 location = candidateParts[candidateParts.length - 1];
             } else {
                 // Fallback: If split failed or no obvious location, regex match for "City, ST" at the end
                 const match = subHeader.match(/([\w\s]+,\s+[A-Z]{2})$/);
                 if (match) {
                     location = match[1];
                 }
             }
        }

        // Fallback: Check H2s if location is still empty
        if (!location && h2s.length > 0) {
            // Strategy 1: Look for exact separate "City, State" H2 (allow mixed case state)
            const locationH2 = h2s.find(h => h && /^[A-Za-z\s\.-]+,\s+[A-Za-z]{2}$/.test(h));
            if (locationH2) {
                location = locationH2;
            }

            // Strategy 2: Look for "City, State • 50 Miler..." pattern in H2s
            if (!location) {
                 for (const h of h2s) {
                     if (!h) continue;
                     const parts = h.split(/[\u2022\u00B7|]|\s-\s/).map(s => s.trim());
                     // Check the first part for "City, State"
                     if (parts.length > 1 && /^[A-Za-z\s\.-]+,\s+[A-Za-z]{2}$/.test(parts[0])) {
                         location = parts[0];
                         break;
                     }
                     // Also check last part just in case
                     if (parts.length > 1 && /^[A-Za-z\s\.-]+,\s+[A-Za-z]{2}$/.test(parts[parts.length-1])) {
                         location = parts[parts.length-1];
                         break;
                     }
                 }
            }
        }
      }

      console.log(`Found race: ${name} (${year}) - ID: ${id} - Location: ${location}`);

      const existingIndex = races.findIndex(r => r.slug === slug && r.year === year);
      
      const newRace: RaceConfig = {
        id: id.toString(),
        year,
        date,
        slug,
        name,
        location, // Add location to config
        events: [
            {
                id: id.toString(),
                title: name,
                waitlist: {
                    dataFile: `races/${year}/${slug}/${slugify(name)}-${id}.waitlist.json`
                },
                entrants: {
                    dataFile: `races/${year}/${slug}/${slugify(name)}-${id}.entrants.json`
                }
            }
        ]
      };

      if (existingIndex >= 0) {
          // Update existing
          console.log(`Updating existing race ${name}.`);
          races[existingIndex] = {
              ...races[existingIndex],
              ...newRace,
              // Preserve existing events if we aren't careful, but here we probably want to assume the scrape is authoritative for high-level info
              // BUT we might lose multi-event config if we just overwrite.
              // For location scraping, let's just merge location.
              location: location || races[existingIndex].location
          };
      } else {
        races.push(newRace);
      }

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Failed to fetch ${url}`, message);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }

  // Ensure data dir exists

  fs.writeFileSync(RACES_FILE, JSON.stringify(races, null, 2));
  console.log(`Updated ${RACES_FILE}`);
}

export const command = "discover";
export const describe = "Discover new races in a range of IDs";
export const builder = {
  start: {
    type: "number",
    description: "Start ID to scan",
    default: 126941,
  },
  end: {
    type: "number",
    description: "End ID to scan",
    default: 127000,
  },
} as const;
export const handler = async (argv: any) => {
  await discover(argv);
};
