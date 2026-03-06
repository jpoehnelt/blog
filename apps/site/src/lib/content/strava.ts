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
import { slugify } from "$lib/utils/slugify";

export interface StravaActivitySimple {
  id: number | string;
  name: string;
  start_date: string | Date;
  distance?: number;
  moving_time?: number;
  total_elevation_gain?: number;
  type?: string;
  sport_type?: string;
  elevation_profile?: number[];
}

export interface SegmentEffort {
  id: number | string;
  name: string;
  elapsed_time: number;
  distance: number;
  average_grade?: number;
  segment: {
    id: number;
    average_grade: number;
  };
  achievements?: {
    type: string;
    rank: number;
  }[];
}

export function mapStravaActivity(
  activity: DetailedActivityResponse,
): StravaActivitySimple {
  let elevation_profile: number[] | undefined;
  const splits =
    (activity as any).splits_metric || (activity as any).splits_standard;

  if (splits && splits.length > 0) {
    elevation_profile = [];
    let current_elevation = 0;
    elevation_profile.push(current_elevation);
    for (const split of splits) {
      const diff = split.elevation_difference || 0;
      current_elevation += diff;
      elevation_profile.push(current_elevation);
    }
  }

  return {
    id: activity.id,
    name: activity.name,
    start_date: activity.start_date,
    type: (activity as any).type,
    sport_type: activity.sport_type,
    distance: activity.distance,
    moving_time: activity.moving_time,
    total_elevation_gain: activity.total_elevation_gain,
    elevation_profile,
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

export function getStravaSegment(id: string): any | undefined {
  const activities = getStravaActivities();
  for (const activity of activities) {
    const segmentEfforts = (activity as any).segment_efforts;
    if (segmentEfforts) {
      const segment = segmentEfforts.find(
        (s: any) => s.segment.id.toString() === id,
      );
      if (segment) return segment.segment;
    }
  }
  return undefined;
}

export function getStravaSegments(): any[] {
  const activities = getStravaActivities();
  const segments = new Map<string, any>();

  for (const activity of activities) {
    const segmentEfforts = (activity as any).segment_efforts;
    if (segmentEfforts) {
      for (const effort of segmentEfforts) {
        const id = effort.segment.id.toString();
        if (!segments.has(id)) {
          segments.set(id, { ...effort.segment, activity_ids: [] });
        }
        segments.get(id).activity_ids.push(activity.id);
      }
    }
  }

  return Array.from(segments.values());
}

export function getStravaSegmentActivities(
  segmentId: string,
): DetailedActivityResponse[] {
  return getStravaActivities().filter((activity) => {
    const segmentEfforts = (activity as any).segment_efforts;
    return (
      segmentEfforts &&
      segmentEfforts.some((s: any) => s.segment.id.toString() === segmentId)
    );
  });
}
