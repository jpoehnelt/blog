import {
  getStravaSegment,
  getStravaSegmentActivities,
} from "$lib/content/strava";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const segment = getStravaSegment(params.id);

  if (!segment) {
    throw error(404, "Segment not found");
  }

  const activities = getStravaSegmentActivities(params.id).sort(
    (a, b) =>
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
  );

  const effortData = activities
    .map((activity) => {
      const effort = (activity as any).segment_efforts?.find(
        (s: any) => s.segment.id.toString() === params.id,
      );
      if (!effort) return null;

      return {
        elapsed_time: effort.elapsed_time,
        average_heartrate: effort.average_heartrate,
        start_date: activity.start_date as unknown as string,
        id: activity.id.toString(),
      };
    })
    .filter(
      (
        d,
      ): d is {
        elapsed_time: number;
        average_heartrate: number;
        start_date: string;
        id: string;
      } =>
        d !== null &&
        d.average_heartrate !== undefined &&
        d.elapsed_time !== undefined,
    );

  return {
    segment,
    activities,
    effortData,
  };
};
