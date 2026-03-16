<script lang="ts">
  import StravaBadge from "$lib/components/StravaBadge.svelte";
  import { formatDuration } from "$lib/utils.js";

  interface Achievement {
    type: string;
    rank: number;
  }

  export interface SegmentEffort {
    id: number | string;
    name: string;
    elapsed_time: number;
    distance: number;
    average_grade?: number;
    segment: {
      id: number;
      average_grade: number;
    };
    achievements?: Achievement[];
  }

  interface Props {
    segment: SegmentEffort;
    class?: string;
    [key: string]: any;
  }

  let { segment, class: className, ...rest }: Props = $props();
</script>

<li
  class="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
  {...rest}
>
  <div class="flex flex-col gap-1 overflow-hidden">
    <div class="flex items-center gap-2">
      <a
        href={`https://www.strava.com/segments/${segment.segment.id}`}
        class="font-medium truncate hover:underline hover:text-primary transition-colors"
        title={segment.name}
        target="_blank"
        rel="noopener noreferrer"
      >
        {segment.name}
      </a>
      {#if segment.achievements && segment.achievements.length > 0}
        <div class="flex gap-1">
          {#each segment.achievements as achievement}
            <StravaBadge {achievement} />
          {/each}
        </div>
      {/if}
    </div>
    <div class="text-xs text-muted-foreground flex gap-3">
      <span>{((segment.distance || 0) / 1000).toFixed(2)} km</span>
      {#if segment.segment?.average_grade !== undefined}
        <span>{segment.segment.average_grade}%</span>
      {/if}
    </div>
  </div>
  <div class="text-sm font-mono font-medium whitespace-nowrap">
    {formatDuration(segment.elapsed_time)}
  </div>
</li>
