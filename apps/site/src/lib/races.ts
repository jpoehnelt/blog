import {
  RaceSchema,
  type Race,
  type Participant,
  type WaitlistHistory,
  ParticipantSchema,
  WaitlistHistorySchema,
} from "@jpoehnelt/ultrasignup-scraper";
import { z } from "zod";

export class RaceDataManager {
  private fetch: typeof fetch;
  private racesCache: Race[] | null = null;

  constructor(fetchInstance: typeof fetch) {
    this.fetch = fetchInstance;
  }

  async getRaces(): Promise<Race[]> {
    if (this.racesCache) {
      return this.racesCache;
    }

    const res = await this.fetch("/data/races.json");
    if (!res.ok) throw new Error(`Failed to fetch races: ${res.statusText}`);
    const json = await res.json();
    this.racesCache = z.array(RaceSchema).parse(json);
    return this.racesCache;
  }

  async getRace(id: number): Promise<Race | undefined> {
    const races = await this.getRaces();
    let race = races.find((r) => r.id === id);
    if (race) return race;

    for (const r of races) {
      const event = r.events.find((e) => e.id === id);
      if (event) {
        return r;
      }
    }

    return undefined;
  }

  async getEntrants(
    raceId: number,
    eventId: number
  ): Promise<Participant[]> {
    const race = await this.getRace(raceId);
    if (!race) throw new Error(`Race ${raceId} not found`);

    const event = race.events.find((e) => e.id === eventId);
    if (!event) throw new Error(`Event ${eventId} not found in race ${raceId}`);

    if (!event.entrants?.dataFile) {
      return [];
    }

    const res = await this.fetch(`/data/${event.entrants.dataFile}`);
    if (!res.ok) {
       throw new Error(`Could not load entrants for event ${eventId}: ${res.statusText}`);
    }
    const json = await res.json();
    return z.array(ParticipantSchema).parse(json);
  }

  async getWaitlist(
    raceId: number,
    eventId: number
  ): Promise<WaitlistHistory> {
    const race = await this.getRace(raceId);
    if (!race) throw new Error(`Race ${raceId} not found`);

    const event = race.events.find((e) => e.id === eventId);
    if (!event) throw new Error(`Event ${eventId} not found in race ${raceId}`);

     if (!event.waitlist?.dataFile) {
      return [];
    }

    const res = await this.fetch(`/data/${event.waitlist.dataFile}`);
    if (!res.ok) {
       throw new Error(`Could not load waitlist for event ${eventId}: ${res.statusText}`);
    }
    const json = await res.json();
    return WaitlistHistorySchema.parse(json);
  }
}
