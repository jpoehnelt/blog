import { getActivitySlug, getStravaActivity } from "$lib/content/strava";
import { error } from "@sveltejs/kit";
import polyline from "@mapbox/polyline";
import type { RequestHandler } from "./$types";

export const prerender = true;

function toGpx(activity: any, coordinates: [number, number][]): string {
  const points = coordinates
    .map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="StravaGPX" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${activity.name}</name>
    <description>${activity.description || ""}</description>
    <time>${activity.start_date}</time>
  </metadata>
  <trk>
    <name>${activity.name}</name>
    <type>${activity.type}</type>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
}

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;
  const activity = getStravaActivity(id);

  if (!activity) {
    throw error(404, "Activity not found");
  }

  const summaryPolyline = activity.map?.summary_polyline;

  if (!summaryPolyline) {
    throw error(404, "No map data available for this activity");
  }

  const coordinates = polyline.decode(summaryPolyline);
  const gpx = toGpx(activity, coordinates);

  return new Response(gpx, {
    headers: {
      "Content-Type": "application/gpx+xml",
      "Content-Disposition": `attachment; filename="${getActivitySlug(activity)
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.gpx"`,
    },
  });
};
