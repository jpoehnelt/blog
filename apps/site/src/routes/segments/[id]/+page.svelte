<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import ActivityList from "$lib/components/ActivityList.svelte";
  import StravaSegmentScatterplot from "$lib/components/StravaSegmentScatterplot.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Head
  title={data.segment.name}
  description={`Strava segment: ${data.segment.name}`}
  pathname={`/segments/${data.segment.id}`}
/>

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
  <div class="space-y-8">
    
    <!-- Segment Header & Stats -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div class="space-y-4">
        <div>
            <h1 class="text-3xl font-bold tracking-tight mb-2">{data.segment.name}</h1>
            <div class="flex flex-wrap gap-2 text-muted-foreground">
                {#if data.segment.city}
                    <span>{data.segment.city}, {data.segment.state}</span>
                {/if}
            </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t">
            <div class="flex flex-col">
                <span class="text-xs text-muted-foreground uppercase font-semibold">Distance</span>
                <span class="text-xl font-medium">{((data.segment.distance || 0) / 1000).toFixed(2)} km</span>
            </div>
            {#if data.segment.average_grade !== undefined}
                <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground uppercase font-semibold">Avg Grade</span>
                    <span class="text-xl font-medium">{data.segment.average_grade}%</span>
                </div>
            {/if}
             {#if data.segment.maximum_grade !== undefined}
                <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground uppercase font-semibold">Max Grade</span>
                    <span class="text-xl font-medium">{data.segment.maximum_grade}%</span>
                </div>
            {/if}
            {#if data.segment.elevation_high && data.segment.elevation_low}
                <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground uppercase font-semibold">Elev Gain</span>
                    <span class="text-xl font-medium">{(data.segment.elevation_high - data.segment.elevation_low).toFixed(0)} m</span>
                </div>
            {/if}
        </div>
      </div>
    </div>

    <!-- Performance Chart -->
    {#if data.effortData && data.effortData.length > 10}
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight">Performance Analysis</h2>
        <p class="text-muted-foreground text-sm">Elapsed Time vs Average Heart Rate</p>
        <StravaSegmentScatterplot data={data.effortData} />
      </div>
    {/if}

    <!-- Associated Activities -->
    <div class="space-y-4">
        <h2 class="text-2xl font-semibold tracking-tight">Activities ({data.activities.length})</h2>
        {#if data.activities.length > 0}
            <ActivityList activities={data.activities} />
        {:else}
            <p class="text-muted-foreground">No activities found matching this segment.</p>
        {/if}
    </div>

  </div>
</main>
