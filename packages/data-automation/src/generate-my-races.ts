/**
 * Scans race data to find races where a specific person is registered.
 * Outputs a JSON index for use in the homepage "My Races" widget.
 *
 * Usage: node generate-my-races.js --name "Poehnelt" --output data/my-races.json
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

interface MyRaceEntry {
  raceId: number;
  eventId: number;
  title: string;
  eventTitle: string;
  date: string;
  location: string;
  type: "entrant" | "waitlist";
  position?: number;
  totalCount?: number;
  slug: string;
}

interface MyRacesOutput {
  generated: string;
  lastName: string;
  races: MyRaceEntry[];
}

interface RaceEvent {
  id: number;
  title: string;
  slug: string;
  waitlist?: { dataFile: string };
  entrants?: { dataFile: string };
}

interface Race {
  id: number;
  title: string;
  slug: string;
  date: string;
  location: string;
  events?: RaceEvent[];
}

interface WaitlistSnapshot {
  date: string;
  count: number;
  applicants?: string[];
}

interface Participant {
  firstName: string;
  lastName: string;
}

async function main() {
  const args = process.argv.slice(2);
  const nameIdx = args.indexOf("--name");
  const outputIdx = args.indexOf("--output");

  const lastName = nameIdx !== -1 ? args[nameIdx + 1] : "Poehnelt";
  const outputPath =
    outputIdx !== -1 ? args[outputIdx + 1] : "data/my-races.json";

  console.log(`Searching for lastName: "${lastName}"`);
  console.log(`Output path: ${outputPath}`);

  // Load races.json to get race metadata
  const racesPath = "data/races.json";
  if (!fs.existsSync(racesPath)) {
    console.error("Error: data/races.json not found");
    process.exit(1);
  }

  const races: Race[] = JSON.parse(fs.readFileSync(racesPath, "utf-8"));
  const raceMap = new Map<number, Race>();
  races.forEach((r) => raceMap.set(r.id, r));

  const myRaces: MyRaceEntry[] = [];

  // Scan entrants files
  const entrantFiles = await glob("data/races/**/*.entrants.json");
  for (const file of entrantFiles) {
    try {
      const data: Participant[] = JSON.parse(fs.readFileSync(file, "utf-8"));
      const position = data.findIndex(
        (p) => p.lastName?.toLowerCase() === lastName.toLowerCase(),
      );

      if (position !== -1) {
        const { raceId, eventId, eventTitle } = parseFilePath(file, races);
        const race = raceMap.get(raceId);
        if (race) {
          myRaces.push({
            raceId,
            eventId,
            title: race.title,
            eventTitle,
            date: race.date,
            location: race.location,
            type: "entrant",
            position: position + 1,
            totalCount: data.length,
            slug: race.slug,
          });
        }
      }
    } catch {
      // Skip malformed files
    }
  }

  // Scan waitlist files
  const waitlistFiles = await glob("data/races/**/*.waitlist.json");
  for (const file of waitlistFiles) {
    // Skip .latest.json files (duplicates)
    if (file.includes(".latest.")) continue;

    try {
      const data: WaitlistSnapshot[] = JSON.parse(
        fs.readFileSync(file, "utf-8"),
      );
      const latestSnapshot = data[data.length - 1];

      if (latestSnapshot?.applicants) {
        const position = latestSnapshot.applicants.findIndex((name) =>
          name.toLowerCase().includes(lastName.toLowerCase()),
        );

        if (position !== -1) {
          const { raceId, eventId, eventTitle } = parseFilePath(file, races);
          const race = raceMap.get(raceId);
          if (race) {
            // Check if already in myRaces as entrant
            const existingIdx = myRaces.findIndex(
              (r) => r.raceId === raceId && r.eventId === eventId,
            );
            if (existingIdx === -1) {
              myRaces.push({
                raceId,
                eventId,
                title: race.title,
                eventTitle,
                date: race.date,
                location: race.location,
                type: "waitlist",
                position: position + 1,
                totalCount: latestSnapshot.count,
                slug: race.slug,
              });
            }
          }
        }
      }
    } catch {
      // Skip malformed files
    }
  }

  // Sort by date
  myRaces.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const output: MyRacesOutput = {
    generated: new Date().toISOString(),
    lastName,
    races: myRaces,
  };

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Found ${myRaces.length} races for ${lastName}`);
  console.log(`Output written to ${outputPath}`);
}

function parseFilePath(
  filePath: string,
  races: Race[],
): { raceId: number; eventId: number; eventTitle: string } {
  // Example: data/races/2026/cocodona/cocodona-250.waitlist.json
  const parts = filePath.split("/");
  const raceSlug = parts[parts.length - 2]; // e.g., "cocodona"
  const fileName = parts[parts.length - 1]; // e.g., "cocodona-250.waitlist.json"
  const eventSlug = fileName.split(".")[0]; // e.g., "cocodona-250"

  // Find matching race
  const race = races.find((r) => r.slug === raceSlug);
  if (!race) return { raceId: 0, eventId: 0, eventTitle: "" };

  // Find matching event
  const event = race.events?.find((e) => e.slug === eventSlug);
  if (!event)
    return { raceId: race.id, eventId: race.id, eventTitle: race.title };

  return { raceId: race.id, eventId: event.id, eventTitle: event.title };
}

await main();
