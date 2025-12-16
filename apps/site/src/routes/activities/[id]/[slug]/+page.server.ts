import { getStravaActivity, getActivitySlug } from "$lib/content/strava";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const activity = getStravaActivity(params.id);

  if (!activity) {
    throw error(404, "Activity not found");
  }

  const expectedSlug = getActivitySlug(activity);
  if (expectedSlug !== `${params.id}/${params.slug}`) {
    throw redirect(301, `/activities/${expectedSlug}`);
  }

  return {
    activity,
  };
};
