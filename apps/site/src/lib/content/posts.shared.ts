import { BASE_URL, POSTS_PREFIX } from "$lib/constants";
import * as v from "valibot";

export const postMetadataSchema = v.object({
  id: v.pipe(v.string(), v.trim()),
  title: v.pipe(v.string(), v.trim()),
  description: v.pipe(v.string(), v.trim()),
  pubDate: v.pipe(
    v.string(),
    v.transform((i) => new Date(i)),
    v.date(),
  ),
  lastMod: v.optional(
    v.pipe(
      v.string(),
      v.transform((i) => new Date(i)),
      v.date(),
    ),
  ),
  tags: v.array(v.string()),
  tweet: v.optional(v.pipe(v.string(), v.trim())),
  syndicate: v.optional(v.boolean(), false),
  faq: v.optional(
    v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
      }),
    ),
  ),
  // Link to UltraSignup race (eventId)
  raceId: v.optional(v.number()),
  // Link to Strava activity
  stravaId: v.optional(v.number()),
});

export function getMetadataFromMatter(
  id: string,
  data: {
    [key: string]: unknown;
  },
) {
  const post = v.parse(postMetadataSchema, {
    id,
    ...data,
  });

  const canonicalURL = new URL(`${POSTS_PREFIX}/${id}/`, BASE_URL).toString();
  const relativeURL = `/${POSTS_PREFIX}/${id}/`;
  const markdownURL = `/${POSTS_PREFIX}/${id}.md`;

  return {
    ...post,
    canonicalURL,
    relativeURL,
    markdownURL,
  };
}

export type Post = ReturnType<typeof getMetadataFromMatter>;
