<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import type { Race } from "@jpoehnelt/ultrasignup-scraper/types";
  import type { EnrichedPageEvent, PageEvent, CompetitivenessStats } from "./types";
  import { raceYearUrl, raceUrl, raceEventUrl } from "$lib/race-urls";

  interface Props {
    race: Race;
    events: PageEvent[];
    activeEvents: EnrichedPageEvent[];
    totalWaitlist: number;
    heroCompetitiveness: CompetitivenessStats | null;
  }

  let { race, events, activeEvents, totalWaitlist, heroCompetitiveness }: Props =
    $props();

  // Check if any active event has waitlist applicants
  let hasWaitlistApplicants = $derived(
    activeEvents.some(
      (e) =>
        e.data &&
        e.data.length > 0 &&
        (e.data[e.data.length - 1].applicants?.length ?? 0) > 0,
    ),
  );

  // Get sibling events (other distances)
  let siblingEvents = $derived(
    race.events?.filter((e) => String(e.id) !== String(activeEvents[0]?.id)) ?? [],
  );
</script>

<div
  class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-stone-100 overflow-hidden"
>
  <!-- Topographic Contour Pattern - Mountain Lines -->
  <div class="absolute inset-0 opacity-[0.07]">
    <svg
      class="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 800 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" stroke="currentColor" stroke-width="1.5" class="text-white">
        <path d="M-50,350 Q100,300 200,320 T400,280 T600,310 T850,270" />
        <path d="M-50,300 Q80,250 180,270 T380,220 T580,250 T850,200" />
        <path d="M-50,250 Q60,180 200,210 T420,150 T620,190 T850,130" />
        <path d="M-50,200 Q120,140 250,160 T450,100 T650,140 T850,80" />
        <path d="M-50,150 Q100,80 220,110 T460,50 T680,90 T850,30" />
        <path d="M-50,100 Q80,40 200,60 T440,10 T660,40 T850,-20" />
        <path d="M-50,325 Q90,280 190,300 T390,250 T590,280 T850,240" opacity="0.5" />
        <path d="M-50,275 Q70,210 190,240 T400,180 T600,220 T850,160" opacity="0.5" />
        <path d="M-50,175 Q110,100 230,130 T455,70 T665,110 T850,50" opacity="0.5" />
      </g>
    </svg>
  </div>

  <!-- Gradient overlays for depth -->
  <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"
  ></div>
  <div class="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-transparent"
  ></div>

  <!-- Accent glow -->
  <div
    class="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
  ></div>
  <div
    class="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"
  ></div>

  <div class="relative container mx-auto px-6 py-16 md:py-24">
    <!-- Breadcrumbs -->
    <Breadcrumb.Root class="mb-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/" class="text-stone-400 hover:text-white transition-colors"
            >Home</Breadcrumb.Link
          >
        </Breadcrumb.Item>
        <Breadcrumb.Separator class="text-stone-600" />
        <Breadcrumb.Item>
          <Breadcrumb.Link
            href="/ultras/races"
            class="text-stone-400 hover:text-white transition-colors">Races</Breadcrumb.Link
          >
        </Breadcrumb.Item>
        <Breadcrumb.Separator class="text-stone-600" />
        <Breadcrumb.Item>
          <Breadcrumb.Link
            href={raceYearUrl(race.year)}
            class="text-stone-400 hover:text-white transition-colors">{race.year}</Breadcrumb.Link
          >
        </Breadcrumb.Item>
        <Breadcrumb.Separator class="text-stone-600" />
        <Breadcrumb.Item>
          <Breadcrumb.Link
            href={raceUrl(race)}
            class="text-stone-400 hover:text-white transition-colors">{race.title}</Breadcrumb.Link
          >
        </Breadcrumb.Item>
        <Breadcrumb.Separator class="text-stone-600" />
        <Breadcrumb.Item>
          <Breadcrumb.Page class="text-white font-medium max-w-[150px] md:max-w-none truncate"
            >{events[0]?.title}</Breadcrumb.Page
          >
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>

    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div class="flex-1">
        <!-- Status Badge and Date -->
        <div class="flex items-center gap-3 mb-2">
          {#if activeEvents.length > 0}
            <span
              class="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-semibold tracking-wide border border-orange-600/30"
              >WAITLIST ACTIVE</span
            >
          {:else}
            <span
              class="px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 text-xs font-semibold tracking-wide border border-slate-600/50"
              >REGISTRATION OPEN</span
            >
          {/if}
          <span class="text-stone-400 text-sm font-medium tracking-wide uppercase"
            >{race.date
              ? new Date(race.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })
              : race.year}</span
          >
        </div>

        <!-- Title Section -->
        <div class="flex flex-col gap-1 mb-2">
          <a
            href={raceUrl(race)}
            class="text-xl md:text-2xl font-bold text-stone-400 hover:text-orange-400 transition-colors inline-flex items-center gap-2 group"
          >
            <svg
              class="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path></svg
            >
            {race.title}
          </a>
          <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white">
            {events[0]?.title}
          </h1>
        </div>

        <!-- Location -->
        <div class="flex items-center text-stone-300 gap-2 mb-6">
          <span class="text-lg font-medium">{race.location}</span>
        </div>

        <!-- Quick Navigation -->
        <nav class="flex flex-wrap gap-x-4 gap-y-1 mb-4">
          {#if activeEvents.some((e) => e.competitiveness)}
            <a href="#field-strength" class="text-stone-400 hover:text-white text-sm font-medium underline decoration-stone-600 hover:decoration-white underline-offset-4 transition-colors">Field Strength</a>
            <a href="#field-comparison" class="text-stone-400 hover:text-white text-sm font-medium underline decoration-stone-600 hover:decoration-white underline-offset-4 transition-colors">Field Comparison</a>
            <a href="#registration" class="text-stone-400 hover:text-white text-sm font-medium underline decoration-stone-600 hover:decoration-white underline-offset-4 transition-colors">Registration</a>
          {/if}
          {#if events.some((e) => e.entrants && e.entrants.length > 0)}
            <a href="#top-men" class="text-stone-400 hover:text-white text-sm font-medium underline decoration-stone-600 hover:decoration-white underline-offset-4 transition-colors">Top Men</a>
            <a href="#top-women" class="text-stone-400 hover:text-white text-sm font-medium underline decoration-stone-600 hover:decoration-white underline-offset-4 transition-colors">Top Women</a>
          {/if}
          {#if hasWaitlistApplicants}
            <a href="#waitlist" class="text-stone-400 hover:text-white text-sm font-medium underline decoration-stone-600 hover:decoration-white underline-offset-4 transition-colors">Waitlist</a>
          {/if}
        </nav>

        <!-- Other Distances Links -->
        {#if siblingEvents.length > 0}
          <div class="flex flex-wrap gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-stone-500 py-1.5"
              >Other Distances:</span
            >
            {#each siblingEvents as sibling}
              <a
                href={raceEventUrl({ year: race.year, slug: race.slug, raceId: race.id, eventId: sibling.id })}
                class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600/20 hover:border-orange-500/50 border border-slate-700 text-stone-300 hover:text-orange-200 text-xs font-bold uppercase tracking-wide transition-all"
              >
                {sibling.title}
              </a>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Hero Stat Cards -->
      {#if totalWaitlist > 0 || heroCompetitiveness}
        <div class="flex gap-4">
          {#if totalWaitlist > 0}
            <div
              class="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl"
            >
              <div class="text-stone-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Waitlist Size
              </div>
              <div class="text-4xl font-black text-white">
                {totalWaitlist.toLocaleString()}
              </div>
              <div class="text-xs text-green-400 font-medium mt-1 flex items-center gap-1">
                Total Applicants
              </div>
            </div>
          {/if}
          {#if heroCompetitiveness}
            <div
              class="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl"
            >
              <div class="text-stone-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Field Strength
              </div>
              <div class="text-4xl font-black text-white">
                {heroCompetitiveness.top20Rank
                  ? heroCompetitiveness.top20Rank.toFixed(1) + "%"
                  : "-"}
              </div>
              <div class="text-xs text-purple-400 font-medium mt-1 flex items-center gap-1">
                {heroCompetitiveness.eliteCount} Elite (90+)
              </div>
            </div>
            <div
              class="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl"
            >
              <div class="text-stone-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Total Entrants
              </div>
              <div class="text-4xl font-black text-white">
                {heroCompetitiveness.totalEntrants > 0
                  ? heroCompetitiveness.totalEntrants.toLocaleString()
                  : "Unknown"}
              </div>
              <div class="text-xs text-blue-400 font-medium mt-1 flex items-center gap-1">
                Registered Runners
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
