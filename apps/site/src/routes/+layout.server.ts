import myRacesData from "$data/my-races.json";
import racesData from "$data/races.json";
import type { LayoutServerLoad } from "./$types";
import type {
  MyRaceEntry,
  MyRaceEntryResolved,
} from "@jpoehnelt/ultrasignup-scraper/types";

export const prerender = true;

interface RaceJson {
  id: number;
  title: string;
  slug: string;
  date: string;
  location: string;
  events?: { id: number; title: string }[];
}

export const load: LayoutServerLoad = async () => {
  const now = new Date();
  const races = racesData as RaceJson[];

  // Create lookup map for races by id
  const raceMap = new Map<number, RaceJson>();
  races.forEach((r) => raceMap.set(r.id, r));

  // Join my-races with races.json and filter to future races
  const myRaces: MyRaceEntryResolved[] = (
    (myRacesData.races || []) as MyRaceEntry[]
  )
    .map((entry) => {
      const race = raceMap.get(entry.raceId);
      if (!race) return null;

      // Find the event title
      const event = race.events?.find((e) => e.id === entry.eventId);
      const title = event?.title || race.title;

      return {
        ...entry,
        title,
        date: race.date,
        location: race.location,
        slug: race.slug,
      };
    })
    .filter(
      (r): r is MyRaceEntryResolved => r !== null && new Date(r.date) > now,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    myRaces,
  };
};
