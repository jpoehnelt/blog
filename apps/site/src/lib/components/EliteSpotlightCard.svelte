<script lang="ts">
  import { raceUrl } from "$lib/race-urls";
  interface EliteRace {
    id: number;
    title: string;
    slug: string;
    year: number;
    eliteCount: number;
    averageRank: number;
  }

  interface Props {
    races: EliteRace[];
  }

  let { races }: Props = $props();
</script>

<div class="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
  <div class="flex items-center justify-between">
    <h3 class="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
      ⭐ Elite Fields
    </h3>
    <a href="/ultras/races" class="text-xs text-muted-foreground hover:underline">
      See all →
    </a>
  </div>
  
  {#if races.length > 0}
    <div class="space-y-3">
      {#each races.slice(0, 3) as race}
        <a 
          href={raceUrl(race)}
          class="block hover:bg-muted/50 -mx-2 px-2 py-2 rounded transition-colors"
        >
          <div class="font-medium mb-1">{race.title}</div>
          <div class="flex items-center gap-3 text-xs">
            <span class="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded font-bold">
              {race.eliteCount} elite
            </span>
            <span class="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded font-bold">
              {race.averageRank.toFixed(0)} avg rank
            </span>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <p class="text-sm text-muted-foreground italic">No data available</p>
  {/if}
</div>
