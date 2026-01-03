import { AUTHOR_NAME } from "$lib/constants";
import type { DetailedActivityResponse } from "strava-v3";

export const stravaData: Record<string, DetailedActivityResponse> =
  import.meta.glob("/src/data/strava/*.json", {
    eager: true,
    import: "default",
  });

let cachedActivities: DetailedActivityResponse[] | null = null;

export function getStravaActivities(): DetailedActivityResponse[] {
  if (cachedActivities) return cachedActivities;
  cachedActivities = Object.values(stravaData).sort((a, b) => {
    // Optimization: Compare ISO strings directly to avoid expensive Date parsing
    if (b.start_date > a.start_date) return 1;
    if (b.start_date < a.start_date) return -1;
    return 0;
  });
  return cachedActivities;
}

export function getStravaActivity(
  id: string,
): DetailedActivityResponse | undefined {
  // Optimization: Try O(1) lookup using the file path key structure from import.meta.glob
  // Fallback to O(N) search if the key format doesn't match
  return (
    stravaData[`/src/data/strava/${id}.json`] ||
    Object.values(stravaData).find((a) => a.id.toString() === id)
  );
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export interface StravaActivitySimple {
  id: number | string;
  name: string;
  start_date: string | Date;
  distance?: number;
  moving_time?: number;
  total_elevation_gain?: number;
  type?: string;
  sport_type?: string;
}

export function mapStravaActivity(
  activity: DetailedActivityResponse,
): StravaActivitySimple {
  return {
    id: activity.id,
    name: activity.name,
    start_date: activity.start_date,
    type: (activity as any).type,
    sport_type: activity.sport_type,
    distance: activity.distance,
    moving_time: activity.moving_time,
    total_elevation_gain: activity.total_elevation_gain,
  };
}

export function getActivitySlug(activity: StravaActivitySimple): string {
  if (!activity.name) return activity.id.toString();
  return `${activity.id}/${slugify(activity.name)}`;
}

export function getActivityDescription(
  activity: DetailedActivityResponse,
): string {
  const distanceKm = ((activity.distance || 0) / 1000).toFixed(2);
  const movingTimeSeconds = activity.moving_time || 0;
  // fast path if distance is roughly 0 to avoid Infinity pace
  const paceSecondsPerKm =
    activity.distance && activity.distance > 0
      ? movingTimeSeconds / (activity.distance / 1000)
      : 0;
  const paceMinutes = Math.floor(paceSecondsPerKm / 60);
  const paceSeconds = Math.floor(paceSecondsPerKm % 60);
  const pace = `${paceMinutes}:${paceSeconds.toString().padStart(2, "0")}`;

  let description = `${AUTHOR_NAME} ran ${distanceKm}km with an average pace of ${pace}/km during ${activity.name}.`;

  if (activity.description) {
    description += `\n\n${activity.description}`;
  }

  description += `\n\nType: ${activity.sport_type || (activity as any).type}`;
  description += `\nDistance: ${distanceKm} km`;
  description += `\nMoving Time: ${new Date(movingTimeSeconds * 1000).toISOString().substr(11, 8)}`;
  description += `\nElevation Gain: ${activity.total_elevation_gain} m`;
  const avgHr = (activity as any).average_heartrate;
  if (avgHr) {
    description += `\nAvg HR: ${Math.round(avgHr)} bpm`;
  }

  const segmentEfforts = (activity as any).segment_efforts;
  if (segmentEfforts && segmentEfforts.length > 0) {
    description += `\n\nSegments:\n`;
    description += segmentEfforts
      .map((segment: any) => `- ${segment.name}`)
      .join("\n");
  }

  return description;
}

// Optimization: Cache segment lookups to avoid O(N) scans.
// This turns getStravaSegment and getStravaSegmentActivities into O(1) operations
// after the first initialization.
let cachedSegmentsMap: Map<
  string,
  { segment: any; activities: DetailedActivityResponse[] }
> | null = null;

function ensureSegmentsCache() {
  if (cachedSegmentsMap) return;
  cachedSegmentsMap = new Map();
  const activities = getStravaActivities();

  // Iterate backwards so that when we push to arrays, the result is in the same order as getStravaActivities (newest first)
  // Wait, getStravaActivities is sorted Newest -> Oldest.
  // If we iterate Newest -> Oldest, and push, the array will be Newest -> Oldest. Correct.
  for (const activity of activities) {
    const segmentEfforts = (activity as any).segment_efforts;
    if (segmentEfforts) {
      for (const effort of segmentEfforts) {
        const segmentId = effort.segment.id.toString();
        if (!cachedSegmentsMap.has(segmentId)) {
          cachedSegmentsMap.set(segmentId, {
            segment: effort.segment,
            activities: [],
          });
        }
        cachedSegmentsMap.get(segmentId)!.activities.push(activity);
      }
    }
  }
}

export function getStravaSegment(id: string): any | undefined {
  ensureSegmentsCache();
  return cachedSegmentsMap?.get(id)?.segment;
}

export function getStravaSegments(): any[] {
  ensureSegmentsCache();
  if (!cachedSegmentsMap) return [];
  // Reconstruct the format expected by consumers (with activity_ids)
  // The cache stores full activity objects, but the original function returned objects with activity_ids array.
  return Array.from(cachedSegmentsMap.values()).map((item) => ({
    ...item.segment,
    activity_ids: item.activities.map((a) => a.id),
  }));
}

export function getStravaSegmentActivities(
  segmentId: string,
): DetailedActivityResponse[] {
  ensureSegmentsCache();
  return cachedSegmentsMap?.get(segmentId)?.activities || [];
}
