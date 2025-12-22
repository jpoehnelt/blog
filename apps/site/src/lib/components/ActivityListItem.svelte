<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
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
      <a
        href={`https://www.strava.com/activities/${activity.id}`}
        target="_blank"
        rel="noopener noreferrer"
        class="text-muted-foreground hover:text-foreground"
        title="View on Strava"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-external-link"
        >
          <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path
            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
          />
        </svg>
      </a>
    </div>
    <div class="text-xs mt-0.5 flex items-center gap-2 flex-wrap text-muted-foreground">
      <FormattedDate date={new Date(activity.start_date)} />
      <span>•</span>
      <span>{activity.sport_type || (activity as any).type}</span>
      <span>•</span>
      <span>{((activity.distance || 0) / 1000).toFixed(2)} km</span>
      {#if (activity.total_elevation_gain || 0) > 0}
        <span>•</span>
        <span>{activity.total_elevation_gain} m</span>
      {/if}
    </div>
  </div>
</div>
