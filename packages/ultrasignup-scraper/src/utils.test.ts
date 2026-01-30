import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import {
  slugify,
  isCompetitiveRace,
  updateRacesJson,
  MIN_ENTRANTS,
  MIN_WAITLIST,
  MIN_ELITE_COUNT,
} from "./utils.js";

describe("slugify", () => {
  it("should convert simple text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should replace multiple spaces with single hyphen", () => {
    expect(slugify("Hello   World")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(slugify("Crazy Mountain 100!")).toBe("crazy-mountain-100");
    expect(slugify("Race (2026)")).toBe("race-2026");
  });

  it("should remove leading and trailing hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
    expect(slugify("---Hello---")).toBe("hello");
  });

  it("should handle empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("should handle numbers", () => {
    expect(slugify("100 Mile Run")).toBe("100-mile-run");
    expect(slugify("50K")).toBe("50k");
  });

  it("should handle already slugified text", () => {
    expect(slugify("already-a-slug")).toBe("already-a-slug");
  });
});

describe("isCompetitiveRace", () => {
  it("should return true if waitlist meets minimum", () => {
    const events = [
      { participants: [], waitlist: Array(MIN_WAITLIST).fill({}) },
    ];
    expect(isCompetitiveRace(events)).toBe(true);
  });

  it("should return true if entrants meet minimum", () => {
    const events = [
      { participants: Array(MIN_ENTRANTS).fill({}), waitlist: [] },
    ];
    expect(isCompetitiveRace(events)).toBe(true);
  });

  it("should return true if elite runners meet minimum", () => {
    const eliteParticipants = Array(MIN_ELITE_COUNT).fill({ rank: 90 });
    const events = [{ participants: eliteParticipants, waitlist: [] }];
    expect(isCompetitiveRace(events)).toBe(true);
  });

  it("should return false if no criteria are met", () => {
    const events = [{ participants: [], waitlist: [] }];
    expect(isCompetitiveRace(events)).toBe(false);
  });

  it("should aggregate across multiple events", () => {
    // Split requirements across two events
    const events = [
      { participants: Array(30).fill({}), waitlist: [] },
      { participants: Array(30).fill({}), waitlist: [] },
    ];
    // 60 total > MIN_ENTRANTS (50)
    expect(isCompetitiveRace(events)).toBe(true);
  });

  it("should handle missing participants or waitlist", () => {
    const events = [
      { participants: undefined as any, waitlist: undefined as any },
    ];
    expect(isCompetitiveRace(events)).toBe(false);
  });

  it("should correctly identify elite runners by rank >= 90", () => {
    const events = [
      {
        participants: [
          { rank: 89 },
          { rank: 90 },
          { rank: 95 },
          { rank: null },
        ],
        waitlist: [],
      },
    ];
    // 2 elite runners (90, 95)
    expect(isCompetitiveRace(events)).toBe(true);
  });

  it("should not count runners with rank < 90 as elite", () => {
    const events = [
      {
        participants: [{ rank: 85 }, { rank: 70 }],
        waitlist: [],
      },
    ];
    expect(isCompetitiveRace(events)).toBe(false);
  });
});

describe("updateRacesJson", () => {
  let tempDir: string;
  let racesJsonPath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "scraper-test-"));
    racesJsonPath = path.join(tempDir, "races.json");
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should create new file if it does not exist", async () => {
    const race = { id: 1, date: "2026-06-01", title: "Test Race" };
    await updateRacesJson(race, racesJsonPath);

    const content = await fs.readFile(racesJsonPath, "utf-8");
    const races = JSON.parse(content);
    expect(races).toHaveLength(1);
    expect(races[0]).toEqual(race);
  });

  it("should add race to existing file", async () => {
    const existing = [{ id: 1, date: "2026-06-01", title: "Existing Race" }];
    await fs.writeFile(racesJsonPath, JSON.stringify(existing));

    const newRace = { id: 2, date: "2026-07-01", title: "New Race" };
    await updateRacesJson(newRace, racesJsonPath);

    const content = await fs.readFile(racesJsonPath, "utf-8");
    const races = JSON.parse(content);
    expect(races).toHaveLength(2);
  });

  it("should update existing race by ID", async () => {
    const existing = [{ id: 1, date: "2026-06-01", title: "Original Title" }];
    await fs.writeFile(racesJsonPath, JSON.stringify(existing));

    const updated = { id: 1, date: "2026-06-01", title: "Updated Title" };
    await updateRacesJson(updated, racesJsonPath);

    const content = await fs.readFile(racesJsonPath, "utf-8");
    const races = JSON.parse(content);
    expect(races).toHaveLength(1);
    expect(races[0].title).toBe("Updated Title");
  });

  it("should sort races by date", async () => {
    const race1 = { id: 1, date: "2026-12-01", title: "December Race" };
    const race2 = { id: 2, date: "2026-01-01", title: "January Race" };
    const race3 = { id: 3, date: "2026-06-15", title: "June Race" };

    await updateRacesJson(race1, racesJsonPath);
    await updateRacesJson(race2, racesJsonPath);
    await updateRacesJson(race3, racesJsonPath);

    const content = await fs.readFile(racesJsonPath, "utf-8");
    const races = JSON.parse(content);
    expect(races[0].title).toBe("January Race");
    expect(races[1].title).toBe("June Race");
    expect(races[2].title).toBe("December Race");
  });

  it("should handle empty existing file", async () => {
    await fs.writeFile(racesJsonPath, "[]");

    const race = { id: 1, date: "2026-06-01", title: "Test Race" };
    await updateRacesJson(race, racesJsonPath);

    const content = await fs.readFile(racesJsonPath, "utf-8");
    const races = JSON.parse(content);
    expect(races).toHaveLength(1);
  });
});

// Import schemas for testing
import {
  RankSchema,
  MyRaceEntrySchema,
  MyRaceEntryResolvedSchema,
  MyRacesDataSchema,
  ParticipantSchema,
  WaitlistApplicantSchema,
} from "./types.js";

describe("RankSchema", () => {
  it("should parse numeric rank", () => {
    expect(RankSchema.parse(95)).toBe(95);
    expect(RankSchema.parse(0)).toBe(0);
  });

  it("should parse string rank", () => {
    expect(RankSchema.parse("90")).toBe(90);
  });

  it("should strip percent sign from rank", () => {
    expect(RankSchema.parse("85%")).toBe(85);
    expect(RankSchema.parse("100%")).toBe(100);
  });

  it("should return 0 for invalid rank", () => {
    expect(RankSchema.parse("N/A")).toBe(0);
    expect(RankSchema.parse("")).toBe(0);
  });
});

describe("MyRaceEntrySchema", () => {
  it("should validate a valid entrant entry", () => {
    const entry = {
      raceId: 126941,
      eventId: 126941,
      type: "entrant",
      position: 42,
      totalCount: 150,
    };
    expect(() => MyRaceEntrySchema.parse(entry)).not.toThrow();
  });

  it("should validate a valid waitlist entry", () => {
    const entry = {
      raceId: 126941,
      eventId: 126941,
      type: "waitlist",
      position: 251,
      totalCount: 771,
    };
    expect(() => MyRaceEntrySchema.parse(entry)).not.toThrow();
  });

  it("should allow optional position and totalCount", () => {
    const entry = {
      raceId: 126941,
      eventId: 126941,
      type: "entrant",
    };
    expect(() => MyRaceEntrySchema.parse(entry)).not.toThrow();
  });

  it("should reject invalid type", () => {
    const entry = {
      raceId: 126941,
      eventId: 126941,
      type: "spectator",
    };
    expect(() => MyRaceEntrySchema.parse(entry)).toThrow();
  });

  it("should reject missing required fields", () => {
    expect(() => MyRaceEntrySchema.parse({ raceId: 1 })).toThrow();
    expect(() => MyRaceEntrySchema.parse({ eventId: 1 })).toThrow();
    expect(() => MyRaceEntrySchema.parse({})).toThrow();
  });
});

describe("MyRaceEntryResolvedSchema", () => {
  it("should validate a fully resolved entry", () => {
    const entry = {
      raceId: 126941,
      eventId: 126941,
      type: "waitlist",
      position: 251,
      totalCount: 771,
      title: "Cocodona 250",
      date: "2026-05-04T11:00:00.000Z",
      location: "Black Canyon City, AZ",
      slug: "cocodona",
    };
    expect(() => MyRaceEntryResolvedSchema.parse(entry)).not.toThrow();
  });

  it("should require additional fields over base entry", () => {
    const entry = {
      raceId: 126941,
      eventId: 126941,
      type: "entrant",
    };
    expect(() => MyRaceEntryResolvedSchema.parse(entry)).toThrow();
  });
});

describe("MyRacesDataSchema", () => {
  it("should validate complete my-races.json structure", () => {
    const data = {
      generated: "2026-01-30T22:59:00.000Z",
      lastName: "Poehnelt",
      races: [
        {
          raceId: 126941,
          eventId: 126941,
          type: "waitlist",
          position: 251,
          totalCount: 771,
        },
        {
          raceId: 128954,
          eventId: 128954,
          type: "entrant",
        },
      ],
    };
    expect(() => MyRacesDataSchema.parse(data)).not.toThrow();
  });

  it("should allow empty races array", () => {
    const data = {
      generated: "2026-01-30T22:59:00.000Z",
      lastName: "Poehnelt",
      races: [],
    };
    expect(() => MyRacesDataSchema.parse(data)).not.toThrow();
  });

  it("should reject missing lastName", () => {
    const data = {
      generated: "2026-01-30T22:59:00.000Z",
      races: [],
    };
    expect(() => MyRacesDataSchema.parse(data)).toThrow();
  });
});

describe("ParticipantSchema", () => {
  it("should validate a participant with all fields", () => {
    const participant = {
      firstName: "Justin",
      lastName: "Poehnelt",
      age: "35",
      gender: "M",
      location: "Denver, CO",
      rank: 92,
      ageRank: 85,
      results: 5,
      finishes: 3,
    };
    const result = ParticipantSchema.parse(participant);
    expect(result.firstName).toBe("Justin");
    expect(result.rank).toBe(92);
  });

  it("should allow minimal participant data", () => {
    const participant = {
      firstName: "John",
      lastName: "Doe",
    };
    expect(() => ParticipantSchema.parse(participant)).not.toThrow();
  });

  it("should coerce string rank to number", () => {
    const participant = {
      firstName: "John",
      lastName: "Doe",
      rank: "88%",
    };
    const result = ParticipantSchema.parse(participant);
    expect(result.rank).toBe(88);
  });
});

describe("WaitlistApplicantSchema", () => {
  it("should require order field", () => {
    const applicant = {
      firstName: "Jane",
      lastName: "Doe",
      order: 42,
    };
    expect(() => WaitlistApplicantSchema.parse(applicant)).not.toThrow();
  });

  it("should reject missing order", () => {
    const applicant = {
      firstName: "Jane",
      lastName: "Doe",
    };
    expect(() => WaitlistApplicantSchema.parse(applicant)).toThrow();
  });
});
