<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import ExternalLink from "$lib/components/ExternalLink.svelte";
  import MetadataSeparator from "$lib/components/MetadataSeparator.svelte";
  import Sparkline from "$lib/components/Sparkline.svelte";
  import { getActivitySlug, type StravaActivitySimple } from "$lib/content/strava";
  import { ExternalLink as ExternalLinkIcon, Footprints } from "@lucide/svelte";

  interface Props {
    activity: StravaActivitySimple;
    [key: string]: any;
  }

  let { activity, ...rest }: Props = $props();
</script>

<li class="flex items-baseline gap-4 py-1" {...rest}>
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
        <ExternalLinkIcon size={12} />
      </ExternalLink>
    </div>
    <div
      class="text-xs mt-0.5 flex items-center gap-2 flex-wrap text-muted-foreground"
    >
      <FormattedDate date={new Date(activity.start_date)} />
      <MetadataSeparator />
      {#if activity.sport_type === "TrailRun" || (activity as any).type === "TrailRun"}
        <Footprints size={14} aria-label="Trail Run" />
      {:else}
        <span>{activity.sport_type || (activity as any).type}</span>
      {/if}
      <MetadataSeparator />
      <span>{((activity.distance || 0) / 1000).toFixed(2)} km</span>
      {#if (activity.total_elevation_gain || 0) > 0}
        <MetadataSeparator />
        <span>{activity.total_elevation_gain} m</span>
      {/if}
    </div>
    {#if activity.elevation_profile && activity.elevation_profile.length > 1}
      <div class="mt-2 h-8 w-full max-w-sm" title="Elevation Profile">
        <Sparkline
          points={activity.elevation_profile}
          height={32}
          width="100%"
          class="text-muted-foreground/50"
        />
      </div>
    {/if}
  </div>
</li>
