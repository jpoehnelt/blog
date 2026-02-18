<script lang="ts">
  import StravaBadge from "$lib/components/StravaBadge.svelte";
  import Metric from "$lib/components/Metric.svelte";

  interface SegmentEffort {
    id: number | string;
    name: string;
    elapsed_time: number;
    distance: number;
    average_grade?: number;
    segment: {
      id: number;
      average_grade: number;
    };
    achievements?: {
      type: string;
      rank: number;
    }[];
  }

  interface Props {
    segments?: SegmentEffort[];
  }

  let { segments = [] }: Props = $props();

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

{#if segments && segments.length > 0}
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Segments</h3>
    <ul class="grid gap-2">
      {#each segments as segment}
        <li
          class="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
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
              <Metric value={((segment.distance || 0) / 1000).toFixed(2)} unit="km" class="text-xs" />
              {#if segment.segment?.average_grade !== undefined}
                <Metric value={segment.segment.average_grade} unit="%" class="text-xs" />
              {/if}
            </div>
          </div>
          <div class="text-sm font-mono font-medium whitespace-nowrap">
            {formatTime(segment.elapsed_time)}
          </div>
        </li>
      {/each}
    </ul>
  </div>
{/if}
