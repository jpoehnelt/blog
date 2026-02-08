<script lang="ts">
  import type { CompetitivenessStats, YearStats } from "./types";
  import RankingsMethodology from "./RankingsMethodology.svelte";

  interface Props {
    competitiveness: CompetitivenessStats;
    yearStats: YearStats | null;
    eventTitle: string;
  }

  let { competitiveness, yearStats, eventTitle }: Props = $props();

  // Calculate position on strength meter
  let meterPosition = $derived.by(() => {
    if (
      !yearStats ||
      yearStats.minTop20Rank <= 0 ||
      !competitiveness.top20Rank
    ) {
      return null;
    }
    const range = yearStats.maxTop20Rank - yearStats.minTop20Rank;
    const positionPct =
      ((competitiveness.top20Rank - yearStats.minTop20Rank) / range) * 100;
    return Math.max(0, Math.min(100, positionPct));
  });

  // Calculate elite percentage
  let elitePercent = $derived(
    competitiveness.totalEntrants > 0
      ? (competitiveness.eliteCount / competitiveness.totalEntrants) * 100
      : 0,
  );

  // Calculate diffs for comparison badges
  let top20Diff = $derived(
    yearStats && yearStats.averageTop20Rank > 0 && competitiveness.top20Rank
      ? competitiveness.top20Rank - yearStats.averageTop20Rank
      : null,
  );

  let eliteCountDiff = $derived(
    yearStats && yearStats.averageEliteCount > 0
      ? competitiveness.eliteCount - yearStats.averageEliteCount
      : null,
  );

  let elitePercentDiff = $derived(
    yearStats && yearStats.averageElitePercent > 0
      ? elitePercent - yearStats.averageElitePercent
      : null,
  );
</script>

<div class="border-b pb-4 last:border-0 last:pb-0">
  <div class="mb-4">
    <div class="grid grid-cols-2 gap-2 mb-3">
      <!-- Field Strength (Top 20 Rank) -->
      <div
        class="bg-slate-50 rounded px-2 py-1.5 relative group"
        title="UltraSignup rank of the 20th strongest runner with 5+ finishes. Higher = deeper field."
      >
        <div class="text-xs text-stone-600 flex items-center gap-1">
          Field Strength
          <svg
            class="w-3 h-3 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
        </div>
        <div class="font-mono text-lg font-bold text-slate-700">
          {competitiveness.top20Rank
            ? competitiveness.top20Rank.toFixed(1)
            : "-"}%
        </div>
        <div class="text-[9px] text-slate-400 font-medium -mt-1">
          Rank of 20th
        </div>

        {#if top20Diff !== null}
          <div
            class="absolute top-1.5 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full {top20Diff >
            0
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'}"
            title="Compared to year average ({yearStats?.averageTop20Rank.toFixed(
              1,
            )}%)"
          >
            {top20Diff > 0 ? "+" : ""}{top20Diff.toFixed(1)}%
          </div>
        {/if}
      </div>

      <!-- Median Rank -->
      <div class="bg-slate-50 rounded px-2 py-1.5 flex flex-col justify-center">
        <div class="text-xs text-stone-600">Median Rank</div>
        <div class="font-mono text-lg font-bold text-slate-700">
          {competitiveness.medianRank.toFixed(1)}%
        </div>
      </div>
    </div>

    <!-- Rank Distribution Bars -->
    <div class="space-y-1">
      {#each competitiveness.rankDistribution as bucket}
        <div class="flex items-center gap-2 text-xs">
          <span class="w-12 text-stone-500 font-medium">{bucket.label}</span>
          <div class="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              class="h-full rounded-full {bucket.label === '90+'
                ? 'bg-purple-500'
                : bucket.label === '80-89'
                  ? 'bg-blue-500'
                  : bucket.label === '60-79'
                    ? 'bg-green-500'
                    : bucket.label === 'New'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'}"
              style="width: {bucket.percent}%"
            ></div>
          </div>
          <span class="w-8 text-right text-stone-400">{bucket.count}</span>
        </div>
      {/each}
    </div>

    <!-- Elite Runners Section -->
    <div class="mt-3">
      <div
        class="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2"
      >
        Elite Runners (90+)
      </div>
      <div class="grid grid-cols-2 gap-2">
        <!-- Count -->
        <div
          class="bg-purple-50 rounded px-2 py-1.5 relative group border border-purple-100"
        >
          <div class="text-xs text-purple-400">Count</div>
          <div class="font-mono text-lg font-bold text-purple-700">
            {competitiveness.eliteCount}
          </div>

          {#if eliteCountDiff !== null}
            <div
              class="absolute top-1.5 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full {eliteCountDiff >=
              0
                ? 'bg-purple-200 text-purple-800'
                : 'bg-slate-100 text-slate-500'}"
              title="Compared to year average ({yearStats?.averageEliteCount.toFixed(
                1,
              )})"
            >
              {eliteCountDiff > 0 ? "+" : ""}{eliteCountDiff.toFixed(1)}
              <span class="opacity-70 font-normal ml-0.5">vs avg</span>
            </div>
          {/if}
        </div>

        <!-- Percentage -->
        <div
          class="bg-purple-50 rounded px-2 py-1.5 flex flex-col justify-center border border-purple-100 relative group"
        >
          <div class="text-xs text-purple-400">% of Field</div>
          <div class="font-mono text-lg font-bold text-purple-700">
            {elitePercent.toFixed(1)}%
          </div>

          {#if elitePercentDiff !== null}
            <div
              class="absolute top-1.5 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full {elitePercentDiff >=
              0
                ? 'bg-purple-200 text-purple-800'
                : 'bg-slate-100 text-slate-500'}"
              title="Compared to year average ({yearStats?.averageElitePercent.toFixed(
                1,
              )}%)"
            >
              {elitePercentDiff > 0 ? "+" : ""}{elitePercentDiff.toFixed(1)}%
              <span class="opacity-70 font-normal ml-0.5">vs avg</span>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <RankingsMethodology {competitiveness} />
  </div>
</div>
