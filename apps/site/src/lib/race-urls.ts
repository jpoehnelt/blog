const BASE = "https://justin.poehnelt.com";

/** Encode a single path segment (handles & and other special chars in slugs) */
const e = (v: string | number, label?: string) => {
  if (v === undefined || v === null || v === "") {
    throw new Error(`Missing required URL segment${label ? `: ${label}` : ""}`);
  }
  return encodeURIComponent(String(v));
};

/**
 * Build a year-level race URL: /ultras/races/{year}
 */
export function raceYearUrl(year: string | number): string {
  return `/ultras/races/${e(year)}`;
}

/**
 * Build a race-level URL: /ultras/races/{year}/{slug}/{raceId}
 *
 * Use only when linking to a race landing page (not a specific event).
 * The `id` must be the **race** id (i.e. the parent race, not an event id).
 */
export function raceUrl(race: {
  year: string | number;
  slug: string;
  id: number | string;
}): string {
  return `/ultras/races/${e(race.year)}/${e(race.slug)}/${e(race.id)}`;
}

/**
 * Build an event-level URL: /ultras/races/{year}/{slug}/{raceId}/{eventId}
 *
 * `raceId` must be the **parent race** id (Race.id / Race.parentId).
 * `eventId` must be the **event** id (the specific distance/event within the race).
 *
 * For single-event races, raceId === eventId is expected and valid.
 */
export function raceEventUrl(params: {
  year: string | number;
  slug: string;
  raceId: number | string;
  eventId: number | string;
}): string {
  return `/ultras/races/${e(params.year)}/${e(params.slug)}/${e(params.raceId)}/${e(params.eventId)}`;
}

/**
 * Absolute URL versions for meta tags, structured data, etc.
 */
export function absoluteRaceYearUrl(year: string | number): string {
  return `${BASE}${raceYearUrl(year)}`;
}

export function absoluteRaceUrl(race: {
  year: string | number;
  slug: string;
  id: number | string;
}): string {
  return `${BASE}${raceUrl(race)}`;
}

export function absoluteRaceEventUrl(params: {
  year: string | number;
  slug: string;
  raceId: number | string;
  eventId: number | string;
}): string {
  return `${BASE}${raceEventUrl(params)}`;
}
