<script lang="ts">
  import { raceUrl } from "$lib/race-urls";
  import SectionHeadline from "$lib/components/SectionHeadline.svelte";

  interface UpcomingRace {
    id: number;
    title: string;
    slug: string;
    date: Date | string;
    location: string;
    year: number;
  }

  interface Props {
    races: UpcomingRace[];
  }

  let { races }: Props = $props();
</script>

<section class="space-y-4">
  <SectionHeadline>
    Upcoming Races
  </SectionHeadline>
  
  {#if races.length > 0}
    <ul class="space-y-3">
      {#each races.slice(0, 5) as race}
        <li>
          <a 
            href={raceUrl(race)}
            class="group flex gap-3"
          >
            <div class="shrink-0 w-12 text-center">
              <div class="text-xs font-bold uppercase text-muted-foreground">
                {new Date(race.date).toLocaleDateString(undefined, { month: "short" })}
              </div>
              <div class="text-lg font-black">
                {new Date(race.date).getDate()}
              </div>
            </div>
            <div class="min-w-0">
              <div class="font-semibold truncate group-hover:underline">
                {race.title}
              </div>
              <div class="text-xs text-muted-foreground truncate">
                {race.location}
              </div>
            </div>
          </a>
        </li>
      {/each}
    </ul>
    <a href="/ultras/races" class="text-xs font-bold uppercase tracking-wider hover:underline block">
      View All Races →
    </a>
  {:else}
    <p class="text-sm text-muted-foreground italic">No upcoming races</p>
  {/if}
</section>
