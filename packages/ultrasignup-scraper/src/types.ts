import { z } from "zod";

export const RankSchema = z.union([z.string(), z.number()]).transform((v) => {
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
}).transform((race) => ({
  ...race,
  year: race.date.getFullYear(),
}));

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
