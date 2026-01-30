<script lang="ts">
  interface HotRace {
    id: number;
    title: string;
    slug: string;
    year: number;
    velocity: number;
  }

  interface Props {
    races: HotRace[];
  }

  let { races }: Props = $props();
</script>

<div class="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
  <div class="flex items-center justify-between">
    <h3 class="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
      🔥 Hot Waitlists
    </h3>
    <a href="/ultras/races" class="text-xs text-muted-foreground hover:underline">
      See all →
    </a>
  </div>
  
  {#if races.length > 0}
    <div class="space-y-2">
      {#each races.slice(0, 5) as race, i}
        <a 
          href="/ultras/races/{race.year}/{race.slug}/{race.id}"
          class="flex items-center justify-between py-1.5 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
            <span class="font-medium truncate">{race.title}</span>
          </div>
          <span class="text-xs font-mono text-green-600 dark:text-green-400 shrink-0">
            +{race.velocity.toFixed(1)}/day
          </span>
        </a>
      {/each}
    </div>
  {:else}
    <p class="text-sm text-muted-foreground italic">No active waitlists</p>
  {/if}
</div>
