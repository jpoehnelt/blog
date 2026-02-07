<script lang="ts">
  import type { EnrichedPageEvent, PercentileStats } from "./types";
  import type { WaitlistSnapshot } from "@jpoehnelt/ultrasignup-scraper/types";

  interface Props {
    event: EnrichedPageEvent;
    lastSnapshot: WaitlistSnapshot;
  }

  let { event, lastSnapshot }: Props = $props();
</script>

<div class="border-t pt-6 first:border-0 first:pt-0">
  <div class="grid grid-cols-2 gap-4">
    <!-- Waitlist Size -->
    <div class="bg-slate-50 rounded-lg p-3">
      <div class="text-xs text-stone-400 uppercase tracking-wide mb-1">
        Waitlist Size
      </div>
      <div class="text-2xl font-bold text-slate-800">
        {lastSnapshot.count}
      </div>
    </div>


  </div>

  <!-- Forecast Section -->
  {#if event.regression && event.regression.projectedPositionChange !== null}
    <div class="mt-4 pt-3 border-t border-stone-100">
      <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
        Forecast
      </div>
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-sm">
          <span class="text-stone-500">Est. Movement by Race Day</span>
          <span
            class="font-mono font-bold {event.regression.projectedPositionChange > 0
              ? 'text-green-600'
              : event.regression.projectedPositionChange < 0
                ? 'text-red-500'
                : 'text-gray-500'}"
          >
            {event.regression.projectedPositionChange > 0 ? "+" : ""}{Math.round(
              event.regression.projectedPositionChange,
            )} pos
          </span>
        </div>
        <div class="text-[10px] text-stone-400">
          Based on current trend (R² {(event.regression.r2 * 100).toFixed(0)}%)
        </div>
      </div>
    </div>
  {/if}

  <!-- 7D Queue Progress -->
  {#if event.percentileStats && event.percentileStats.length > 0}
    <div class="mt-4 pt-3 border-t border-stone-100">
      <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
        7D Queue Progress
      </div>
      <div class="grid grid-cols-3 gap-2">
        {#each event.percentileStats as stat}
          <div class="bg-slate-50 rounded px-2 py-1.5 flex flex-col items-center">
            <span class="text-xs text-stone-600 mb-0.5">
                {stat.percentile === 0
                  ? "Front"
                  : stat.percentile === 33
                    ? "Top 33%"
                    : "Top 66%"}
            </span>
            <span
              class="font-mono text-sm font-medium {stat.velocity > 0
                ? 'text-green-600'
                : stat.velocity < 0
                  ? 'text-red-500'
                  : 'text-slate-400'}"
            >
              {stat.velocity > 0 ? "+" : ""}{stat.velocity.toFixed(0)}
            </span>
          </div>
        {/each}
      </div>
      <div class="text-xs text-stone-400 mt-2 italic">
        Total position change over 7D
      </div>
    </div>
  {/if}

  <!-- Last Updated -->
  <div class="text-xs text-gray-400 mt-3">
    Updated: {new Date(lastSnapshot.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })}
  </div>
</div>
