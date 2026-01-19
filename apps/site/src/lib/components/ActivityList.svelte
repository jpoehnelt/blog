<script lang="ts">
  import ActivityListItem from "$lib/components/ActivityListItem.svelte";
  import type { StravaActivitySimple } from "$lib/content/strava";

  interface Props {
    activities: StravaActivitySimple[];
  }

  let { activities }: Props = $props();
</script>

<ul class="space-y-1 max-w-4xl list-none p-0">
  {#each activities as activity}
    <ActivityListItem {activity} />
  {/each}
</ul>
