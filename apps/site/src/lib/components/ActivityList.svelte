<script lang="ts">
  import ActivityListItem from "$lib/components/ActivityListItem.svelte";
  import type { StravaActivitySimple } from "$lib/content/strava";
  import type { DetailedActivityResponse } from "strava-v3";

  interface Props {
    activities: StravaActivitySimple[];
  }

  let { activities }: Props = $props();
</script>

<div class="space-y-1 max-w-4xl">
  {#each activities as activity}
    <ActivityListItem {activity} />
  {/each}
</div>
