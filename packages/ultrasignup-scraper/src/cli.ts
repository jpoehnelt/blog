import { Command } from "commander";
import { Scraper, type Race } from "./index.js";
import * as fs from "fs/promises";
import * as path from "path";
import pLimit from "p-limit";
import {
  slugify,
  isCompetitiveRace,
  updateRacesJson,
  MIN_ENTRANTS,
} from "./utils.js";

const program = new Command();

program
  .name("ultrasignup")
  .description("Ultrasignup scraper CLI")
  .version("0.0.1");

program
  .command("discover")
  .description("Discover events")
  .argument("<start>", "Start ID")
  .argument("<end>", "End ID")
  .action(async (start, end) => {
    const races = await Scraper.discover(Number(start), Number(end));
    console.log(JSON.stringify(races, null, 2));
  });

program
  .command("info")
  .description("Get event info")
  .argument("<id>", "Event ID")
  .action(async (id) => {
    const race = new Scraper(Number(id));
    const eventInfo = await race.getRace();
    console.log(JSON.stringify(eventInfo, null, 2));
  });

program
  .command("events")
  .description("Get event info")
  .argument("<id>", "Main event ID")
  .action(async (id) => {
    const race = new Scraper(Number(id));
    const events = await race.getEvents();
    console.log(JSON.stringify(events, null, 2));
  });

async function saveRaceData(info: Race, outDir: string) {
  const mainDid = info.id;
  const race = new Scraper(mainDid);

  const year = info.date.getFullYear().toString();
  const mainSlug = info.slug ?? slugify(info.title);
  const raceDir = path.join(outDir, year, mainSlug);

  await fs.mkdir(raceDir, { recursive: true });

  // 2. Get Events (sub-events)
  console.log(`Fetching events for ${mainDid} (${info.title})...`);
  const events = await race.getEvents();

  const results = [];

  // 3. Process each sub-event
  for (const event of events) {
    const eventSlug = slugify(event.title);
    const baseFilename = eventSlug;

    // Entrants
    const entrantsPath = path.join(raceDir, `${baseFilename}.entrants.json`);
    await fs.writeFile(
      entrantsPath,
      JSON.stringify(event.participants, null, 2),
    );

    // Waitlist History
    const waitlistPath = path.join(raceDir, `${baseFilename}.waitlist.json`);
    let waitlistHistory: any[] = [];
    try {
      const existing = await fs.readFile(waitlistPath, "utf-8");
      waitlistHistory = JSON.parse(existing);
    } catch (e) {
      // File doesn't exist or error reading, start fresh
    }

    const today = new Date().toISOString().split("T")[0];
    const snapshot = {
      date: today,
      count: event.waitlist.length,
      applicants: event.waitlist.map((a) =>
        `${a.firstName} ${a.lastName}`.trim(),
      ),
    };

    // Append if there are waitlist entries, or if the previous snapshot had entries
    // (to record the transition to an empty waitlist)
    const lastSnapshot = waitlistHistory[waitlistHistory.length - 1];
    if (event.waitlist.length > 0 || (lastSnapshot && lastSnapshot.count > 0)) {
      // Deduplicate: remove today's entry if it exists
      waitlistHistory = waitlistHistory.filter((h) => h.date !== today);
      waitlistHistory.push(snapshot);
      // Sort by date just in case
      waitlistHistory.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }

    // Always write the waitlist file (even if empty) since races.json references it
    await fs.writeFile(waitlistPath, JSON.stringify(waitlistHistory, null, 2));

    results.push({
      id: event.id,
      title: event.title,
      slug: event.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      waitlist: {
        dataFile: `races/${year}/${mainSlug}/${baseFilename}.waitlist.json`,
      },
      entrants: {
        dataFile: `races/${year}/${mainSlug}/${baseFilename}.entrants.json`,
      },
    });
  }

  // 4. Return Race Object for race.json
  return {
    ...info,
    slug: mainSlug, // Ensure slug is updated in returned object
    events: results,
  };
}

program
  .command("scrape")
  .description(
    "Discover and ingest new races (filters for competitive/popular races)",
  )
  .argument("<start>", "Start ID")
  .argument("<end>", "End ID")
  .option("-o, --out-dir <dir>", "Output directory", "../../data/races")
  .option("--no-filter", "Disable competitive race filtering")
  .action(async (startStr, endStr, options) => {
    const start = Number(startStr);
    const end = Number(endStr);
    const outDir = path.resolve(process.cwd(), options.outDir);
    const racesJsonPath = path.resolve(outDir, "../races.json");
    const filterEnabled = options.filter !== false;

    const limit = pLimit(5);
    const tasks = [];

    console.log(`Scraping range ${start} to ${end}...`);
    if (filterEnabled) {
      console.log(
        `Filtering: min ${MIN_ENTRANTS} entrants OR waitlist OR elite runners`,
      );
    }

    for (let id = start; id <= end; id++) {
      tasks.push(
        limit(async () => {
          const race = new Scraper(id);
          let info;
          try {
            info = await race.getRace();
          } catch (e) {
            // Ignore errors for individual races during discovery
            return;
          }

          // Check if main event
          if (info.parentId !== id) {
            process.stdout.write("."); // Skip sub-events
            return;
          }

          // Get events to check competitiveness
          let events;
          try {
            events = await race.getEvents();
          } catch (e) {
            process.stdout.write("!"); // Error fetching events
            return;
          }

          if (filterEnabled && !isCompetitiveRace(events)) {
            process.stdout.write("x"); // Skip non-competitive races
            return;
          }

          console.log(`\n✓ Found: ${id} - ${info.title}`);
          const raceData = await saveRaceData(info, outDir);
          await updateRacesJson(raceData, racesJsonPath);
        }),
      );
    }

    await Promise.all(tasks);
    console.log("\nDone.");
  });

program
  .command("update")
  .description("Update all known races in races.json")
  .option("-f, --file <file>", "Path to races.json", "../../data/races.json")
  .option(
    "-o, --out-dir <dir>",
    "Output directory for race data",
    "../../data/races",
  )
  .option("--id <id>", "Update only the race with this ID")
  .action(async (options) => {
    const racesJsonPath = path.resolve(process.cwd(), options.file);
    const outDir = path.resolve(process.cwd(), options.outDir);
    const filterById = options.id ? Number(options.id) : null;

    console.log(`Updating races from ${racesJsonPath}...`);

    const content = await fs.readFile(racesJsonPath, "utf-8");
    let races: Race[] = JSON.parse(content);

    // Filter to specific ID if provided
    if (filterById) {
      const targetRace = races.find((r) => r.id === filterById);
      if (!targetRace) {
        console.error(`Race with ID ${filterById} not found in races.json`);
        process.exit(1);
      }
      races = [targetRace];
      console.log(
        `Filtering to single race: ${targetRace.title} (${filterById})`,
      );
    }

    const limit = pLimit(5);
    const tasks = races.map((race) =>
      limit(async () => {
        const id = race.id;
        const title = race.title;
        console.log(`Updating ${title} (${id})...`);

        // We need to fetch fresh info to get updated date/location/etc
        const raceInstance = new Scraper(id);
        const info = await raceInstance.getRace();

        const updatedRaceData = await saveRaceData(info, outDir);
        return updatedRaceData;
      }),
    );

    const updatedRaces = await Promise.all(tasks);

    // If we filtered by ID, merge the result back into the full list
    if (filterById) {
      const fullContent = await fs.readFile(racesJsonPath, "utf-8");
      const fullRaces: Race[] = JSON.parse(fullContent);
      const updatedRace = updatedRaces[0];
      const index = fullRaces.findIndex((r) => r.id === filterById);
      if (index !== -1) {
        fullRaces[index] = updatedRace;
      }
      fullRaces.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      await fs.writeFile(racesJsonPath, JSON.stringify(fullRaces, null, 2));
    } else {
      // Sort and save all
      updatedRaces.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      await fs.writeFile(racesJsonPath, JSON.stringify(updatedRaces, null, 2));
    }
    console.log("Update complete.");
  });

program
  .command("my-races")
  .description("Generate index of races for a specific person")
  .option("-n, --name <lastName>", "Last name to search for", "Poehnelt")
  .option(
    "-o, --output <path>",
    "Output JSON file path",
    "../../data/my-races.json",
  )
  .option("-d, --data-dir <dir>", "Data directory", "../../data")
  .action(async (options) => {
    const { name: lastName, output, dataDir } = options;
    const dataPath = path.resolve(process.cwd(), dataDir);
    const outputPath = path.resolve(process.cwd(), output);
    const racesJsonPath = path.join(dataPath, "races.json");

    console.log(`Searching for lastName: "${lastName}"`);
    console.log(`Output path: ${outputPath}`);

    // Load races.json
    let races: Race[];
    try {
      const content = await fs.readFile(racesJsonPath, "utf-8");
      races = JSON.parse(content);
    } catch {
      console.error(`Error: ${racesJsonPath} not found`);
      process.exit(1);
    }

    const raceMap = new Map<number, Race>();
    races.forEach((r) => raceMap.set(r.id, r));

    interface MyRaceEntry {
      raceId: number;
      eventId: number;
      type: "entrant" | "waitlist";
      position?: number;
      totalCount?: number;
    }

    const myRaces: MyRaceEntry[] = [];

    // Helper to parse file path
    function parseFilePath(filePath: string): {
      raceId: number;
      eventId: number;
    } {
      const parts = filePath.split("/");
      const raceSlug = parts[parts.length - 2];
      const fileName = parts[parts.length - 1];
      const eventSlug = fileName.split(".")[0];

      const race = races.find((r) => r.slug === raceSlug);
      if (!race) return { raceId: 0, eventId: 0 };

      const event = race.events?.find((e: any) => e.slug === eventSlug);
      if (!event) return { raceId: race.id, eventId: race.id };

      return { raceId: race.id, eventId: event.id };
    }

    // Scan entrants files
    const racesDir = path.join(dataPath, "races");
    const { glob } = await import("glob");

    const entrantFiles = await glob(`${racesDir}/**/*.entrants.json`);
    for (const file of entrantFiles) {
      try {
        const content = await fs.readFile(file, "utf-8");
        const data: Array<{ firstName: string; lastName: string }> =
          JSON.parse(content);
        const position = data.findIndex(
          (p) => p.lastName?.toLowerCase() === lastName.toLowerCase(),
        );

        if (position !== -1) {
          const { raceId, eventId } = parseFilePath(file);
          if (raceMap.has(raceId)) {
            myRaces.push({
              raceId,
              eventId,
              type: "entrant",
              position: position + 1,
              totalCount: data.length,
            });
          }
        }
      } catch {
        // Skip malformed files
      }
    }

    // Scan waitlist files
    const waitlistFiles = await glob(`${racesDir}/**/*.waitlist.json`);
    for (const file of waitlistFiles) {
      if (file.includes(".latest.")) continue;

      try {
        const content = await fs.readFile(file, "utf-8");
        const data: Array<{
          date: string;
          count: number;
          applicants?: string[];
        }> = JSON.parse(content);
        const latestSnapshot = data[data.length - 1];

        if (latestSnapshot?.applicants) {
          const position = latestSnapshot.applicants.findIndex((name) =>
            name.toLowerCase().includes(lastName.toLowerCase()),
          );

          if (position !== -1) {
            const { raceId, eventId } = parseFilePath(file);
            if (raceMap.has(raceId)) {
              // Check if already in myRaces as entrant
              const existingIdx = myRaces.findIndex(
                (r) => r.raceId === raceId && r.eventId === eventId,
              );
              if (existingIdx === -1) {
                myRaces.push({
                  raceId,
                  eventId,
                  type: "waitlist",
                  position: position + 1,
                  totalCount: latestSnapshot.count,
                });
              }
            }
          }
        }
      } catch {
        // Skip malformed files
      }
    }

    const output_data = {
      generated: new Date().toISOString(),
      lastName,
      races: myRaces,
    };

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(output_data, null, 2));

    console.log(`Found ${myRaces.length} races for ${lastName}`);
    console.log(`Output written to ${outputPath}`);
  });

program.parse();
