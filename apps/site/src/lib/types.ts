export type {
  RaceEventSummary,
  Participant,
  WaitlistSnapshot,
  WaitlistApplicant,
} from "@jpoehnelt/ultrasignup-scraper";

import type { Race as ScraperRace, RaceEventSummary } from "@jpoehnelt/ultrasignup-scraper";

export interface Entrant {
  firstName: string;
  lastName: string;
  location: string;
  age: string;
  gender?: string;
  rank: number;
  results: number;
  eventTitle?: string;
}

export interface EventData {
  date: string;
  count: number;
  applicants: string[];
}

export interface RaceEvent {
  title: string;
  id: string;
  entrants?: Entrant[];
  data?: EventData[];
}

export interface Race extends Omit<ScraperRace, "id"> {
  id: string;
  name: string;
  year: string;
  events: RaceEventSummary[];
}
