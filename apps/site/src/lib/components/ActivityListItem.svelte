<script lang="ts">
  import { ExternalLink as ExternalLinkIcon } from "@lucide/svelte";
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Separator from "$lib/components/Separator.svelte";
  import ExternalLink from "$lib/components/ExternalLink.svelte";
  import { getActivitySlug, type StravaActivitySimple } from "$lib/content/strava";

  interface Props {
    activity: StravaActivitySimple;
  }

  let { activity }: Props = $props();
</script>

<li class="flex items-baseline gap-2 py-1">
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-2">
      <a
        href={`/activities/${getActivitySlug(activity)}`}
        class="hover:underline font-medium"
      >
        {activity.name}
      </a>
      <ExternalLink
        href={`https://www.strava.com/activities/${activity.id}`}
        class="text-muted-foreground hover:text-foreground"
        aria-label="View on Strava (opens in a new tab)"
      >
        <ExternalLinkIcon size="12" />
      </ExternalLink>
    </div>
    <div
      class="text-xs mt-0.5 flex items-center gap-2 flex-wrap text-muted-foreground"
    >
      <FormattedDate date={new Date(activity.start_date)} />
      <Separator class="text-muted-foreground" />
      <span>{activity.sport_type || (activity as any).type}</span>
      <Separator class="text-muted-foreground" />
      <span>{((activity.distance || 0) / 1000).toFixed(2)} km</span>
      {#if (activity.total_elevation_gain || 0) > 0}
        <Separator class="text-muted-foreground" />
        <span>{activity.total_elevation_gain} m</span>
      {/if}
    </div>
  </div>
</li>
