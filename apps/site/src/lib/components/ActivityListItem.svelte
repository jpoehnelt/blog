<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import StravaLink from "$lib/components/StravaLink.svelte";
  import { getActivitySlug, type StravaActivitySimple } from "$lib/content/strava";

  interface Props {
    activity: StravaActivitySimple;
  }

  let { activity }: Props = $props();
</script>

<div class="flex items-baseline gap-2 py-1">
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-2">
      <a
        href={`/activities/${getActivitySlug(activity)}`}
        class="hover:underline font-medium"
      >
        {activity.name}
      </a>
      <StravaLink
        activityId={activity.id}
        class="text-muted-foreground hover:text-foreground hover:no-underline"
        iconClass="size-3"
      />
    </div>
    <div class="text-xs mt-0.5 flex items-center gap-2 flex-wrap text-muted-foreground">
      <FormattedDate date={new Date(activity.start_date)} />
      <span aria-hidden="true">•</span>
      <span>{activity.sport_type || (activity as any).type}</span>
      <span aria-hidden="true">•</span>
      <span>{((activity.distance || 0) / 1000).toFixed(2)} km</span>
      {#if (activity.total_elevation_gain || 0) > 0}
        <span aria-hidden="true">•</span>
        <span>{activity.total_elevation_gain} m</span>
      {/if}
    </div>
  </div>
</div>
