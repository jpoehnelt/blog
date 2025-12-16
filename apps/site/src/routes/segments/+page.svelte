<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Head
  title="Popular Segments"
  description="Most popular Strava segments from Justin Poehnelt's activities."
  pathname="/segments"
/>

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
  <div class="space-y-6">
    <h1 class="text-3xl font-bold tracking-tight">Popular Segments</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each data.segments as segment}
        <a href={`/segments/${segment.id}`} class="block group">
          <div class="h-full rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
            <div class="space-y-2">
              <h2 class="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {segment.name}
              </h2>
              
              <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {#if segment.city}
                    <span>{segment.city}, {segment.state}</span>
                {/if}
              </div>
            </div>

            <div class="mt-4 flex items-center gap-4 text-sm">
                <div class="flex flex-col">
                    <span class="text-xs text-muted-foreground uppercase">Distance</span>
                    <span class="font-medium">{((segment.distance || 0) / 1000).toFixed(2)} km</span>
                </div>
                {#if segment.average_grade !== undefined}
                    <div class="flex flex-col">
                        <span class="text-xs text-muted-foreground uppercase">Grade</span>
                        <span class="font-medium">{segment.average_grade}%</span>
                    </div>
                {/if}
                {#if segment.elevation_high && segment.elevation_low}
                    <div class="flex flex-col">
                        <span class="text-xs text-muted-foreground uppercase">Elev Diff</span>
                        <span class="font-medium">{(segment.elevation_high - segment.elevation_low).toFixed(0)} m</span>
                    </div>
                {/if}
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</main>
