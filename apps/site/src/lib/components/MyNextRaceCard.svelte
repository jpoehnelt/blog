<script lang="ts">
  import { differenceInDays } from "date-fns";
  import type { MyRaceEntryResolved } from "@jpoehnelt/ultrasignup-scraper/types";
  import { raceEventUrl } from "$lib/race-urls";
  import SectionHeadline from "$lib/components/SectionHeadline.svelte";

  interface Props {
    races: MyRaceEntryResolved[];
  }

  let { races }: Props = $props();

  function getDaysUntil(date: string) {
    return differenceInDays(new Date(date), new Date());
  }
</script>

{#if races.length > 0}
  <section class="space-y-4">
    <SectionHeadline>
      My Race{races.length > 1 ? "s" : ""}
    </SectionHeadline>
    <div class="space-y-4">
      {#each races as race}
        <a 
          href={raceEventUrl({ year: new Date(race.date).getFullYear(), slug: race.slug, raceId: race.raceId, eventId: race.eventId })}
          class="block group"
        >
          <div class="space-y-2">
            <div class="font-black text-lg leading-tight group-hover:underline decoration-2">
              {race.title}
            </div>
            <div class="text-sm text-muted-foreground">
              {race.location}
            </div>
            
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded font-bold">
                ⏱️ {getDaysUntil(race.date)} days
              </div>
              
              {#if race.type === "waitlist" && race.position}
                <div class="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded font-bold">
                  #{race.position}
                  <span class="font-normal text-xs">/ {race.totalCount}</span>
                </div>
              {:else if race.type === "entrant"}
                <div class="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded font-bold">
                  ✓ Registered
                </div>
              {/if}
            </div>
            
            <div class="text-xs text-muted-foreground">
              {new Date(race.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </a>
        {#if races.indexOf(race) < races.length - 1}
          <hr class="border-border" />
        {/if}
      {/each}
    </div>
  </section>
{/if}
