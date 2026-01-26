<script lang="ts">
  import ActivityListItem from "$lib/components/ActivityListItem.svelte";
  import type { StravaActivitySimple } from "$lib/content/strava";

  interface Props {
    activities: StravaActivitySimple[];
  }

  let { activities }: Props = $props();

  let maxElevationRange = $derived(
    Math.max(
      100,
      ...activities.map((a) => {
        if (!a.elevation_profile || a.elevation_profile.length === 0) return 0;
        const min = Math.min(...a.elevation_profile);
        const max = Math.max(...a.elevation_profile);
        return max - min;
      })
    )
  );
</script>

<ul class="space-y-1 max-w-4xl list-none p-0 m-0">
  {#each activities as activity}
    <ActivityListItem {activity} elevationDomainMax={maxElevationRange} />
  {/each}
</ul>
