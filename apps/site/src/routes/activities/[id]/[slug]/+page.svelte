<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Head from "$lib/components/Head.svelte";
  import { tick } from "svelte";
  import { initGoogleMaps, importLibrary } from "$lib/maps";
  import polyline from "@mapbox/polyline";
  import { Button } from "$lib/components/ui/button";
  import {
    getActivityDescription,
    getActivitySlug,
    slugify,
  } from "$lib/content/strava";
  import StravaLink from "$lib/components/StravaLink.svelte";
  import StravaSegmentList from "$lib/components/StravaSegmentList.svelte";
  import JsonLd from "$lib/components/JsonLd.svelte";
  import type {
    ExerciseAction,
    SportsEvent,
    BreadcrumbList,
    Thing,
    WithContext,
  } from "schema-dts";
  import { AUTHOR_NAME, BASE_URL } from "$lib/constants";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const { activity } = data;

  const canonicalURL = new URL(
    `/activities/${getActivitySlug(activity)}/`,
    BASE_URL
  ).toString();

  let schema: WithContext<Thing>[] = $derived.by(() => {
    const list: WithContext<Thing>[] = [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Activities",
            item: new URL("/activities/", BASE_URL).toString(),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: activity.name || "Activity",
            item: canonicalURL,
          },
        ],
      } as WithContext<BreadcrumbList>,
      {
        "@context": "https://schema.org",
        "@type": "ExerciseAction",
        agent: {
          "@type": "Person",
          name: AUTHOR_NAME,
        },
        name: activity.name,
        description: getActivityDescription(activity),
        startTime: activity.start_date?.toString(),
        distance: {
          "@type": "Distance",
          name: `${((activity.distance || 0) / 1000).toFixed(2)} km`,
        },
        duration: `PT${activity.moving_time}S`,
        url: canonicalURL,
      } as WithContext<ExerciseAction>,
    ];

    if ((activity as any).workout_type === 1) {
      list.push({
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: activity.name,
        description: "Running Race",
        startDate: activity.start_date?.toString(),
        location: {
          "@type": "Place",
          name: (activity as any).location_city || "Race Course",
        },
        competitor: {
          "@type": "Person",
          name: AUTHOR_NAME,
        },
      } as WithContext<SportsEvent>);
    }

    return list;
  });

  let mapElement: any = $state();
  let polylineElement: any = $state();
  let showMap = $state(false);

  async function loadMap() {
    showMap = true;
    await tick();

    if (activity.map?.summary_polyline) {
      initGoogleMaps();

      const { LatLngBounds } = (await importLibrary("core")) as any;
      await importLibrary("maps3d");
      await importLibrary("geometry");
      const bounds = new LatLngBounds();

      const decodedPath = polyline.decode(activity.map.summary_polyline);
      const coordinates = decodedPath.map(([lat, lng]) => {
        const coord = { lat, lng, altitude: 0 };
        bounds.extend(coord);
        return coord;
      });

      if (polylineElement) {
        polylineElement.path = coordinates;
      }

      if (mapElement && coordinates.length > 0) {
        const { spherical } = (await importLibrary("geometry")) as any;
        const center = bounds.getCenter();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const distance = spherical.computeDistanceBetween(sw, ne);

        // Adjust bounds for tilt. The camera needs to be further away if we are looking straight down,
        // but with a high tilt (e.g. 75), we are looking "across".
        // With a 75 degree tilt, we need to be much further back to see the whole bounds.
        const range = Math.max(4000, distance * 2);

        const avgElevation =
          (activity as any).elev_high && (activity as any).elev_low
            ? ((activity as any).elev_high + (activity as any).elev_low) / 2
            : 0;

        mapElement.center = {
          lat: center.lat(),
          lng: center.lng(),
          altitude: avgElevation,
        };
        mapElement.range = range;

        mapElement.tilt = 60; // Respected from HTML
      }
    }
  }
</script>

<Head
  title={activity.name}
  description={getActivityDescription(activity)}
  pathname={`/activities/${getActivitySlug(activity)}/`}
  type="article"
  publishedTime={activity.start_date?.toString()}
/>

<JsonLd {schema} />

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
  <article class="prose prose-lg max-w-none">
    <div class="flex flex-col gap-2">
      <h1 class="mb-0">{activity.name}</h1>
      <div class="text-sm text-muted-foreground flex items-center gap-2">
        <FormattedDate date={new Date(activity.start_date)} />
        <span aria-hidden="true">•</span>
        <span>{activity.sport_type || (activity as any).type}</span>
      </div>

      <div class="mt-8 flex items-center gap-4">
        <StravaLink activityId={activity.id} />
        {#if activity.map?.summary_polyline}
          <span class="text-muted-foreground" aria-hidden="true">•</span>
          <a
            href={`/activities/${activity.id}/download.gpx`}
            class="text-sm font-medium text-muted-foreground hover:text-primary hover:underline"
            download={`${slugify(activity.name)}-${activity.id}.gpx`}
          >
            GPX
          </a>
        {/if}
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground uppercase font-semibold"
            >Distance</span
          >
          <span class="text-xl font-medium"
            >{((activity.distance || 0) / 1000).toFixed(2)} km</span
          >
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground uppercase font-semibold"
            >Moving Time</span
          >
          <span class="text-xl font-medium"
            >{new Date((activity.moving_time || 0) * 1000)
              .toISOString()
              .substr(11, 8)}</span
          >
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-muted-foreground uppercase font-semibold"
            >Elevation</span
          >
          <span class="text-xl font-medium"
            >{activity.total_elevation_gain} m</span
          >
        </div>
        {#if (activity as any).average_heartrate}
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground uppercase font-semibold"
              >Avg HR</span
            >
            <span class="text-xl font-medium"
              >{Math.round((activity as any).average_heartrate)} bpm</span
            >
          </div>
        {/if}
      </div>

      {#if (activity as any).photos?.primary?.urls?.["600"]}
        <div class="my-6 flex justify-center">
          <div class="rounded-lg overflow-hidden max-w-xl w-full">
            <img
              src={(activity as any).photos.primary.urls["600"]}
              alt={activity.name}
              class="w-full h-auto object-cover"
            />
          </div>
        </div>
      {/if}

      {#if activity.description}
        <div class="my-6">
          <div class="prose prose-lg max-w-none">
            <p>{activity.description}</p>
          </div>
        </div>
      {/if}

      <div class="my-6">
        <StravaSegmentList segments={(activity as any).segment_efforts} />
      </div>

      {#if showMap}
        <div
          class="h-[500px] w-full rounded-lg overflow-hidden my-6 relative bg-muted"
        >
          <gmp-map-3d
            mode="SATELLITE"
            bind:this={mapElement}
            class="w-full h-full"
          >
            <gmp-polyline-3d
              bind:this={polylineElement}
              stroke-color="#ef4444"
              stroke-width="4"
              altitude-mode="clamp-to-ground"
            ></gmp-polyline-3d>
          </gmp-map-3d>
        </div>
      {:else}
        <div class="my-6 w-full flex justify-center">
          <Button onclick={loadMap} variant="outline">Show Map</Button>
        </div>
      {/if}
    </div>
  </article>
</main>
