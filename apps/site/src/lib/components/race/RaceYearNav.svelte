<script lang="ts">
  import { raceYearUrl } from "$lib/race-urls";

  interface Props {
    years: number[];
    activeYear?: number | string | null;
    activeCompetitive?: boolean;
  }

  let { years, activeYear = null, activeCompetitive = false }: Props = $props();
</script>

{#if years.length > 0}
  <div class="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-xl inline-flex flex-wrap gap-2">
    {#each years as y}
      <a
        href={raceYearUrl(y)}
        class="px-4 py-2 rounded-xl text-sm font-bold transition-all border
        {y === Number(activeYear)
            ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/20'
            : 'bg-slate-700/50 text-stone-400 border-slate-600 hover:bg-slate-700 hover:text-stone-200 hover:border-slate-500'}"
      >
        {y}
      </a>
    {/each}
    <span class="w-px bg-slate-600 mx-1"></span>
    <a
      href="/ultras/races/competitive"
      class="px-4 py-2 rounded-xl text-sm font-bold transition-all border
      {activeCompetitive
          ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/20'
          : 'bg-slate-700/50 text-stone-400 border-slate-600 hover:bg-slate-700 hover:text-stone-200 hover:border-slate-500'}"
    >
      🏆 Competitive
    </a>
  </div>
{/if}
