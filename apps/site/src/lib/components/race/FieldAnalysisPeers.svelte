<script lang="ts">
  import type { RaceWithCompetitiveness } from "./types";
  import { raceEventUrl } from "$lib/race-urls";

  interface Props {
    racesForYear: RaceWithCompetitiveness[];
    currentRaceId: string;
    year: number;
  }

  let { racesForYear, currentRaceId, year }: Props = $props();

  // Filter and sort qualified races
  let allQualifiedRaces = $derived(
    racesForYear
      .filter(
        (r) =>
          r.competitiveness &&
          r.competitiveness.totalEntrants >= 50 &&
          r.competitiveness.top20Rank,
      )
      .sort(
        (a, b) =>
          (b.competitiveness.top20Rank || 0) -
          (a.competitiveness.top20Rank || 0),
      ),
  );

  // Find current race position
  let currentRaceIdx = $derived(
    allQualifiedRaces.findIndex((r) => String(r.id) === String(currentRaceId)),
  );

  // Unified display list with gaps
  let displayList = $derived.by(() => {
    if (allQualifiedRaces.length === 0) return [];

    const indices = new Set<number>([0, 1, 2, 3, 4]); // Top 5
    
    if (currentRaceIdx !== -1) {
      indices.add(currentRaceIdx - 1);
      indices.add(currentRaceIdx);
      indices.add(currentRaceIdx + 1);
    }

    const sortedIndices = Array.from(indices)
      .filter((i) => i >= 0 && i < allQualifiedRaces.length)
      .sort((a, b) => a - b);

    const list: { type: "race" | "gap"; race?: RaceWithCompetitiveness; rank?: number }[] = [];
    
    for (let i = 0; i < sortedIndices.length; i++) {
        const idx = sortedIndices[i];
        
        // Check for gap
        if (i > 0 && idx > sortedIndices[i-1] + 1) {
            list.push({ type: "gap" });
        }
        
        list.push({ 
            type: "race", 
            race: allQualifiedRaces[idx],
            rank: idx + 1 // rank is 1-based index
        });
    }

    // Trailing gap if not at the end
    if (allQualifiedRaces.length > 0 && sortedIndices[sortedIndices.length - 1] < allQualifiedRaces.length - 1) {
        list.push({ type: "gap" });
    }

    return list;
  });

  // Helper to check if a race is the current one
  function isCurrent(raceId: string | number): boolean {
    return String(raceId) === String(currentRaceId);
  }
</script>

{#if allQualifiedRaces.length > 0}
  <div class="mt-6 pt-4 border-t border-stone-100">
    <div class="flex justify-between items-center mb-3">
      <div class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Field Analysis & Peers
      </div>
      <a
        href="/ultras/races/competitive"
        class="text-[10px] font-bold uppercase tracking-wide text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
      >
        View The Most Competitive Ultra Races
      </a>
    </div>

    <div class="space-y-1">
      <div class="text-[10px] uppercase text-stone-400 font-medium mb-1 pl-1">
        Strongest {year} Fields
      </div>
      
      {#each displayList as item}
        {#if item.type === "gap"}
            <div class="flex items-center justify-center py-1">
                <div class="h-1 w-1 rounded-full bg-stone-300 mx-0.5"></div>
                <div class="h-1 w-1 rounded-full bg-stone-300 mx-0.5"></div>
                <div class="h-1 w-1 rounded-full bg-stone-300 mx-0.5"></div>
            </div>
        {:else if item.race}
          {@const r = item.race}
          <a
            href={raceEventUrl({ year, slug: r.slug, raceId: r.raceId ?? r.id, eventId: r.eventId ?? r.id })}
            class="block rounded px-2 py-1.5 transition-colors group {isCurrent(r.id) ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50 hover:bg-slate-100'}"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1.5 overflow-hidden">
                <span
                  class="text-[9px] font-bold w-4 inline-block text-right {isCurrent(r.id) ? 'text-orange-500' : 'text-slate-400'}"
                  >#{item.rank}</span
                >
                <span
                  class="text-xs font-medium truncate {isCurrent(r.id) ? 'text-orange-700 font-bold' : 'text-slate-700 group-hover:text-orange-600'}"
                  >{r.title}{#if isCurrent(r.id)} ←{/if}</span
                >
              </div>
              <span
                class="text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[3.5rem] text-center {isCurrent(r.id) ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-white text-slate-500 border border-slate-200'}"
              >
                {r.competitiveness.top20Rank ? r.competitiveness.top20Rank.toFixed(1) + '%' : '-'}
              </span>
            </div>
          </a>
        {/if}
      {/each}
    </div>
  </div>
{/if}
