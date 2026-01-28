import { JSDOM } from "jsdom";
import { z } from "zod";

import got, { HTTPError } from "got";

const RankSchema = z.union([z.string(), z.number()]).transform((v) => {
  const s = String(v).replace("%", "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
});

export const BaseSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.number().optional(),
});

export const RunnerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  age: z.string().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  rank: RankSchema.optional(),
});

export const ParticipantSchema = RunnerSchema.extend({
  rank: RankSchema.optional(),
  ageRank: RankSchema.optional(),
  results: z.coerce.number().optional(),
  target: z.string().optional(),
  bib: z.string().optional(),
  age: z.string().optional(),
  finishes: z.coerce.number().optional(),
});

export const WaitlistApplicantSchema = RunnerSchema.extend({
  order: z.number(),
});

export const EventSchema = BaseSchema.extend({
  participants: z.array(ParticipantSchema),
  waitlist: z.array(WaitlistApplicantSchema),
});

// Race Event Summary (as stored in races.json)
export const RaceEventSummarySchema = BaseSchema.extend({
  waitlist: z
    .object({
      dataFile: z.string(),
    })
    .optional(),
  entrants: z
    .object({
      dataFile: z.string(),
    })
    .optional(),
});

export const RaceSchema = BaseSchema.extend({
  date: z.coerce.date(),
  location: z.string(),
  website: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  events: z.array(RaceEventSummarySchema),
});

export const WaitlistSnapshotSchema = z.object({
  date: z.string(),
  count: z.number(),
  applicants: z.array(z.string()),
});

export const WaitlistHistorySchema = z.array(WaitlistSnapshotSchema);
export const ParticipantsDataSchema = z.array(ParticipantSchema);

export type Race = z.infer<typeof RaceSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type WaitlistApplicant = z.infer<typeof WaitlistApplicantSchema>;
export type RaceEventSummary = z.infer<typeof RaceEventSummarySchema>;
export type WaitlistSnapshot = z.infer<typeof WaitlistSnapshotSchema>;
export type WaitlistHistory = z.infer<typeof WaitlistHistorySchema>;

const client = got.extend({
  retry: {
    limit: 5,
  },
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
});

/**
 * Fetch a URL and return the HTML content.
 * Throws an error if the fetch fails.
 *
 * @param url - The URL to fetch
 * @param ttl - The TTL in milliseconds (default: 24h)
 * @returns The response body and final URL
 */
export async function scrape(
  url: string,
): Promise<{ body: string; url?: string }> {
  const response = await client.get(url);

  return { body: response.body, url: response.url };
}

const URLS = {
  BASE: "https://ultrasignup.com",
  EVENT: "https://ultrasignup.com/register.aspx?did={id}",
  TEAM: "https://ultrasignup.com/relay/teams.aspx?did={id}",
  ENTRANTS: "https://ultrasignup.com/entrants_event.aspx?did={id}",
  WAITLIST: "https://ultrasignup.com/event_waitlist.aspx?did={id}",
  PARTICIPANT:
    "https://ultrasignup.com/results_participant.aspx?fname={firstName}&lname={lastName}",
};

export class Scraper {
  constructor(public readonly id: number) {}

  static async discover(start: number, end: number): Promise<Race[]> {
    return (
      await Promise.all(
        Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
          async (id) => {
            try {
              return await new Scraper(id).getRace();
            } catch (error) {
              if (
                error instanceof HTTPError &&
                error.response.statusCode === 403
              ) {
                console.error(`Failed to fetch ${id}, ${error.response.url}`);
                return null;
              }

              throw error;
            }
          },
        ),
      )
    ).filter((race) => race !== null && race.parentId === race.id) as Race[];
  }

  private parseAceData(aceData: string): Pick<Race, "date" | "location"> {
    // if aceData is has 2 opening braces and 1 closing brace, it's malformed, fix it
    if (aceData.split("{").length === 3 && aceData.split("}").length === 2) {
      aceData += "}";
    }

    const { time: { start } = {}, location } = JSON.parse(aceData);
    const date = start ? new Date(start) : undefined;

    return RaceSchema.pick({
      date: true,
      location: true,
    }).parse({ date, location });
  }

  async getRace(): Promise<Race> {
    const url = URLS.EVENT.replace("{id}", String(this.id));
    const { body: html } = await scrape(url);
    const root = new JSDOM(html).window.document.body;

    const titleElement = root.querySelector(".event-title");
    const parentUrl = new URL(
      (titleElement?.parentElement as HTMLAnchorElement)?.href,
      URLS.BASE,
    ).toString();

    if (!parentUrl) {
      throw new Error(`No parent href found for ${url}`);
    }

    const { url: parentFinalUrl } = await scrape(parentUrl);
    if (parentUrl.match(/id=(\d+)/)?.[1]) {
    }
    const parentId = Number(parentFinalUrl?.match(/id=(\d+)/)?.[1]);

    const title = titleElement?.textContent?.trim() ?? "";
    const { date, location } = this.parseAceData(
      root.querySelector("a.ace_btn")?.getAttribute("data-ace") ?? "{}",
    );

    // Location and coordinates are in the same link
    const addressLink = root.querySelector<HTMLAnchorElement>("a.address_link");
    // const location = addressLink?.textContent?.trim() ?? "";
    const latLngMatch = addressLink?.href?.match(/q=([\d\.-]+),([\d\.-]+)/);
    const [lat, lng] = latLngMatch ? latLngMatch.slice(1) : [0, 0];

    const data = {
      id: this.id,
      parentId: parentId,
      title,
      date,
      location,
      lat,
      lng,
      slug: title.toLowerCase().replace(/\s/g, "-"),
      events: [],
    };

    return RaceSchema.parse(data);
  }

  async getEvents(): Promise<
    {
      id: number;
      title: string;
      type: "TEAM" | "INDIVIDUAL";
      waitlist: WaitlistApplicant[];
      participants: Participant[];
    }[]
  > {
    const url = URLS.ENTRANTS.replace("{id}", String(this.id));
    let html;
    try {
      const result = await scrape(url);
      html = result.body;
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      return [];
    }

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const elements = Array.from(
      doc.querySelectorAll<HTMLAnchorElement>("a[href*='did=']"),
    ).filter(
      (element) =>
        element.classList.contains("event_link") ||
        element.classList.contains("event_selected_link"),
    );

    const events: {
      id: number;
      title: string;
      type: "TEAM" | "INDIVIDUAL";
    }[] = elements.map((element) => {
      const url = new URL(element.getAttribute("href") || "", URLS.BASE);
      const id = Number(url.searchParams.get("did"));
      const title = element.textContent?.trim() || "";
      const type = element.href.includes("teams.aspx") ? "TEAM" : "INDIVIDUAL";

      return { id, title, type };
    });

    const waitlists = await Promise.all(
      events.map((e) => this.getWaitlist(e.id)),
    );

    const participants = await Promise.all(
      events.map((e) => this.getParticipants(e.id)),
    );

    return events.map((e, i) => ({
      ...e,
      waitlist: waitlists[i] ?? [],
      participants: participants[i] ?? [],
    }));
  }

  private async getWaitlist(id: number): Promise<WaitlistApplicant[]> {
    const url = URLS.WAITLIST.replace("{id}", String(id));
    const { body: html } = await scrape(url);
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const table = doc.querySelector("table.ultra_grid");
    if (!table) {
      return [];
    }

    const rows = Array.from(table.querySelectorAll("tr"));
    const waitlistApplicants: WaitlistApplicant[] = [];

    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length === 0) continue;

      // Waitlist structure:
      // 0: Order (1)
      // 1: &nbsp;
      // 2: Name (Link)
      // 3: Home
      // 4: Rank

      if (cells.length < 5) continue;

      const orderCell = cells[0];
      if (isNaN(Number(orderCell.textContent?.trim()))) continue;
      const nameCell = cells[2];
      const homeCell = cells[3];
      const rankCell = cells[4];

      const waitlistApplicant: WaitlistApplicant = {
        order: Number(orderCell.textContent?.trim()),
        firstName: "",
        lastName: "",
        location: homeCell.textContent?.trim() ?? "",
        rank: RankSchema.parse(rankCell.textContent?.trim() ?? "0"),
      };

      const link = nameCell.querySelector("a");

      if (link?.href) {
        const url = new URL(link.href, URLS.BASE);
        const urlParams = new URLSearchParams(url.search);
        waitlistApplicant.firstName = urlParams.get("fname") || "";
        waitlistApplicant.lastName = urlParams.get("lname") || "";
        waitlistApplicant.age = urlParams.get("age") || "0";
      }

      waitlistApplicants.push(WaitlistApplicantSchema.parse(waitlistApplicant));
    }

    return waitlistApplicants;
  }

  private async getParticipants(id: number): Promise<Participant[]> {
    const url = URLS.ENTRANTS.replace("{id}", String(id));
    const { body: html } = await scrape(url);
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const table = doc.querySelector("table.ultra_grid");
    if (!table) {
      return [];
    }

    const rows = Array.from(table.querySelectorAll("tr"));
    const participants: Participant[] = [];

    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length === 0) continue;

      if (cells.length < 13)
        throw new Error(`Failed to find cells for id ${id}`);

      const cols = {
        rank: cells[0],
        ageRank: cells[1],
        results: cells[2],
        target: cells[3],
        age: cells[4],
        firstName: cells[6],
        lastName: cells[7],
        city: cells[8],
        state: cells[9],
        category: cells[10],
        bib: cells[11],
        finishes: cells[12],
        profile: cells[13],
      };

      const participant: Participant = {
        rank: RankSchema.parse(cols.rank.textContent?.trim() ?? "0"),
        ageRank: RankSchema.parse(cols.ageRank.textContent?.trim() ?? "0"),
        results: Number(cols.results.textContent?.trim() || "0"),
        firstName: cols.firstName.textContent?.trim() || "",
        lastName: cols.lastName.textContent?.trim() || "",
        location: `${cols.city.textContent?.trim()}, ${cols.state.textContent?.trim()}`,
        bib: cols.bib.textContent?.trim(),
        age: cols.age.textContent?.trim(),
        finishes: Number(cols.finishes.textContent?.trim() || "0"),
      };

      participants.push(ParticipantSchema.parse(participant));
    }

    return participants;
  }
}
