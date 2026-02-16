<script lang="ts">
  import { differenceInDays } from "date-fns";
  import type { MyRaceEntryResolved } from "@jpoehnelt/ultrasignup-scraper/types";
  import { raceEventUrl } from "$lib/race-urls";
  import MetricBadge from "$lib/components/MetricBadge.svelte";

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
    <h2 class="text-xl font-bold uppercase border-b-2 border-foreground pb-1 tracking-wider">
      My Race{races.length > 1 ? "s" : ""}
    </h2>
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
              <MetricBadge variant="orange" class="text-sm py-1">
                ⏱️ {getDaysUntil(race.date)} days
              </MetricBadge>
              
              {#if race.type === "waitlist" && race.position}
                <MetricBadge variant="purple" class="text-sm py-1">
                  #{race.position}
                  <span class="font-normal text-xs">/ {race.totalCount}</span>
                </MetricBadge>
              {:else if race.type === "entrant"}
                <MetricBadge variant="green" class="text-sm py-1">
                  ✓ Registered
                </MetricBadge>
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
