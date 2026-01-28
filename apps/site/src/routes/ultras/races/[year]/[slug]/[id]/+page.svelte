<script lang="ts">
  import WaitlistChart from "$lib/components/WaitlistChart.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import * as Tabs from "$lib/components/ui/tabs";

  import type { Race, RaceEvent, EventData, Entrant } from "$lib/types";

  let { data } = $props<{ data: { race: Race; events: RaceEvent[] } }>();

  let race = $derived(data.race);
  let events = $derived(data.events || []);
  
  // ... existing code ...


  const THEME = {
    primary: "text-orange-700",
    bgPrimary: "bg-orange-700",
    secondary: "text-slate-600",
    bgSecondary: "bg-slate-600",
    accent: "text-stone-500",
    bgAccent: "bg-stone-100",
  };

  // Filter out events with 0 runners on the waitlist
  let activeEvents = $derived(
    events.filter((e: RaceEvent) => {
      if (!e.data || e.data.length === 0) return false;
      const lastPoint = e.data[e.data.length - 1];
      return (lastPoint?.count || 0) > 0;
    }),
  );

  // Pre-calculate snapshot maps for each event (1d, 7d, 30d)
  let diffMaps = $derived(
    activeEvents.reduce((acc: Record<string, Record<number, Map<string, number>>>, event: RaceEvent) => {
        if (!event.data || event.data.length === 0) return acc;
        
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const maps: Record<number, Map<string, number>> = {};

        [1, 7, 30].forEach(days => {
            const targetDate = new Date(now.getTime() - days * oneDay);
            // Find closest snapshot
            const snapshot = event.data?.reduce((closest: EventData, curr: EventData) => {
                const currDiff = Math.abs(new Date(curr.date).getTime() - targetDate.getTime());
                const closestDiff = Math.abs(new Date(closest.date).getTime() - targetDate.getTime());
                return currDiff < closestDiff ? curr : closest;
            });

            const map = new Map<string, number>();
            if (snapshot && snapshot.applicants) {
                snapshot.applicants.forEach((name: string, idx: number) => map.set(name, idx));
            }
            maps[days] = map;
        });

        acc[event.id] = maps;
        return acc;
    }, {} as Record<string, Record<number, Map<string, number>>>)
  );

  // Entrants Logic
  let entrants = $derived(
    events.flatMap((e: RaceEvent) =>
      (e.entrants || []).map((entrant: Entrant) => ({
        ...entrant,
        eventTitle: e.title,
      })),
    ),
  );

  const HIGH_PERFORMER_RANK = 85;
  const MIN_RESULTS = 5;
  const QUALIFIED_QUOTA = 10;

  function getTopEntrants(allEntrants: Entrant[], genderPrefix: string) {
    // 1. Filter by gender (M/F prefix in age string)
    const genderEntrants = allEntrants.filter(
      (e) => e.age && e.age.startsWith(genderPrefix),
    );

    // 2. Sort by Rank (descending)
    // Rank is already a number from Zod schema (0-100)
    const sorted = [...genderEntrants].sort(
      (a, b) => (b.rank || 0) - (a.rank || 0),
    );

    const topList = [];
    let count = 0;

    for (const e of sorted) {
      const results = e.results || 0;
      const rank = e.rank || 0;

      const isHighPerformer = rank > HIGH_PERFORMER_RANK && results > MIN_RESULTS;
      const isQualified = results >= MIN_RESULTS;

      // Always include high performers (>90% rank & >5 results)
      // OR if we haven't reached our quota of 5 qualified runners yet
      if (isHighPerformer || count < QUALIFIED_QUOTA) {
        topList.push(e);
        if (isQualified) {
          count++;
        }
      } else {
        // If we have 5 qualified runners and this isn't a high performer, stop
        // (Since list is sorted by rank, subsequent runners won't be high performers either)
        break;
      }
    }
    return topList;
  }

  let topMen = $derived(getTopEntrants(entrants, "M"));
  let topWomen = $derived(getTopEntrants(entrants, "F"));

  let athleteJsonLd = $derived(
    [...topMen, ...topWomen].map((athlete) => ({
      "@context": "https://schema.org",
      "@type": "Person",
      name: `${athlete.firstName} ${athlete.lastName}`,
      homeLocation: {
        "@type": "Place",
        name: athlete.location,
      },
      performerIn: {
        "@type": "Event",
        name: race.name,
        startDate: race.date,
        location: {
          "@type": "Place",
          name: race.location,
        },
      },
    })),
  );

  let title = $derived(`${race.name} ${race.year} Waitlist & Stats`);
  let description = $derived(
    `Detailed waitlist analysis, clearance rates, and statistics for the ${race.year} ${race.name}.`,
  );

  let jsonLd = $derived([
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://justin.poehnelt.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `${race.year} Waitlists`,
          item: `https://justin.poehnelt.com/ultras/races/${race.year}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: race.name,
          item: `https://justin.poehnelt.com/ultras/races/${race.year}/${race.slug}/${race.id}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${race.name} ${race.year}`,
      startDate: race.date || race.year,
      location: {
        "@type": "Place",
        name: race.location || "TBD",
      },
      description: description,
      url: `https://justin.poehnelt.com/ultras/races/${race.year}/${race.slug}/${race.id}`,
    },
  ]);

  function getPositionDiffs(eventId: string, applicant: string, currentIdx: number) {
    if (!diffMaps[eventId]) return { d1: 0, d7: 0, d30: 0 };

    const getDiff = (days: number) => {
        const pastIdx = diffMaps[eventId][days]?.get(applicant);
        if (pastIdx === undefined) return null;
        return pastIdx - currentIdx;
    };

    return {
      d1: getDiff(1),
      d7: getDiff(7),
      d30: getDiff(30),
    };
  }

  let searchTerms: Record<string, string> = $state({});
</script>

{#snippet ChangeIndicator(diff: number | null)}
  <div
    class={`text-xs font-mono w-8 text-center ${diff === null ? "text-gray-300" : diff === 0 ? "text-gray-400 font-bold" : diff > 0 ? "text-green-600" : "text-red-500"}`}
  >
    {#if diff === null}
      -
    {:else if diff === 0}
      =
    {:else if diff > 0}
      ▲{diff}
    {:else}
      ▼{Math.abs(diff)}
    {/if}
  </div>
{/snippet}

{#snippet EntrantList(list: Entrant[], title: string, theme: 'blue' | 'rose')}
  <div class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden h-full">
    <div class="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <span class={`w-2 h-2 rounded-full ${theme === 'blue' ? 'bg-blue-600' : 'bg-rose-500'}`}></span> {title}
      </h3>
      <span class="text-xs font-semibold text-stone-400 uppercase tracking-wide">Rank Score</span>
    </div>
    <div class="divide-y divide-stone-100">
      {#each list as m}
        <div class="px-6 py-4 hover:bg-stone-50 transition-colors flex items-center gap-4 group">
          <div class={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-stone-100 ${theme === 'blue' ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-500'}`}>
            {m.firstName[0]}{m.lastName[0]}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-1">
              <div class={`font-bold text-slate-800 truncate transition-colors ${theme === 'blue' ? 'group-hover:text-blue-700' : 'group-hover:text-rose-600'}`}>{m.firstName} {m.lastName}</div>
              <div class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{m.results} results</div>
            </div>
            <div class="relative h-2 w-full bg-stone-100 rounded-full overflow-hidden">
              <div class={`absolute h-full rounded-full transition-all duration-500 ease-out ${theme === 'blue' ? 'bg-blue-500' : 'bg-rose-500'}`} style="width: {m.rank}%"></div>
            </div>
            <div class="flex justify-between mt-1.5 text-xs text-stone-500">
              <div class="flex items-center gap-1">
                <svg class="w-3 h-3 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {m.location}
              </div>
              <div class={`font-mono font-bold ${theme === 'blue' ? 'text-blue-600' : 'text-rose-600'}`} title="Rank Score">{m.rank}%</div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/snippet}

<svelte:head>
  <title>{race.year} {race.name} Waitlist Analysis</title>
  {#each athleteJsonLd as ld}
    {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
  {/each}
</svelte:head>

<div class="min-h-screen bg-stone-50 pb-20">
  <!-- Hero Section -->
  <div class="relative bg-slate-900 text-stone-100 overflow-hidden">
    <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
    
    <div class="relative container mx-auto px-6 py-12 md:py-20">
      <Breadcrumb.Root class="mb-6">
         <Breadcrumb.List>
            <Breadcrumb.Item>
               <Breadcrumb.Link href="/" class="text-stone-400 hover:text-white transition-colors">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator class="text-stone-600" />
            <Breadcrumb.Item>
               <Breadcrumb.Link href="/ultras/races" class="text-stone-400 hover:text-white transition-colors">Races</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator class="text-stone-600" />
            <Breadcrumb.Item>
               <Breadcrumb.Link href="/ultras/races/{race.year}" class="text-stone-400 hover:text-white transition-colors">{race.year}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator class="text-stone-600" />
            <Breadcrumb.Item>
               <Breadcrumb.Link href="/ultras/races/{race.year}/{race.slug}" class="text-stone-400 hover:text-white transition-colors">{race.name}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator class="text-stone-600" />
            <Breadcrumb.Item>
               <Breadcrumb.Page class="text-white font-medium max-w-[150px] md:max-w-none truncate">{activeEvents[0]?.title}</Breadcrumb.Page>
            </Breadcrumb.Item>
         </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-semibold tracking-wide border border-orange-600/30">WAITLIST ACTIVE</span>
            <span class="text-stone-400 text-sm font-medium tracking-wide uppercase">{race.date ? new Date(race.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : race.year}</span>
          </div>
          <div class="flex flex-col gap-1 mb-2">
            <div class="text-xl md:text-2xl font-bold text-stone-400">{race.name}</div>
            <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white">{activeEvents[0]?.title}</h1>
          </div>
          <div class="flex items-center text-stone-300 gap-2 mb-6">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span class="text-lg font-medium">{race.location}</span>
          </div>
          
          {#if race.events && race.events.filter((e: any) => String(e.id) !== String(activeEvents[0]?.id)).length > 0}
             <div class="flex flex-wrap gap-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-stone-500 py-1.5">Other Distances:</span>
                {#each race.events.filter((e: any) => String(e.id) !== String(activeEvents[0]?.id)) as sibling}
                   <a href="/ultras/races/{race.year}/{race.slug}/{sibling.id}" 
                      class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600/20 hover:border-orange-500/50 border border-slate-700 text-stone-300 hover:text-orange-200 text-xs font-bold uppercase tracking-wide transition-all">
                      {sibling.title}
                   </a>
                {/each}
             </div>
          {/if}
        </div>

        {#if activeEvents.length > 0}
          {@const totalWaitlist = activeEvents.reduce((acc: number, e: RaceEvent) => acc + ( (e.data && e.data.length > 0) ? (e.data[e.data.length - 1]?.count || 0) : 0), 0)}
          <div class="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl">
             <div class="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1">Waitlist Size</div>
             <div class="text-4xl font-black text-white">{totalWaitlist.toLocaleString()}</div>
             <div class="text-xs text-green-400 font-medium mt-1 flex items-center gap-1">
                Total Applicants
             </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="container mx-auto px-6 -mt-8 relative z-10 space-y-8">

  {#if activeEvents.length === 0}
    <div class="p-4 bg-gray-100 rounded-lg text-gray-600">
      No data available for this category yet.
    </div>
  {:else}
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Waitlist Analysis</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Clearance Rate Chart -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium mb-4">Waitlist Trends</h3>
          {#if activeEvents.some((e: RaceEvent) => e.data && e.data.length > 1)}
            <WaitlistChart
              events={activeEvents}
            />
          {:else}
            <p class="text-gray-500">
              Not enough data to calculate velocity yet.
            </p>
          {/if}
        </div>

        <!-- Latest Stats -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium mb-4">Waitlist Size</h3>
          <div class="space-y-4">
            {#each activeEvents as event}
              {#if event.data && event.data.length > 0}
                {@const last = event.data[event.data.length - 1]}
                <div class="flex justify-between items-center border-b pb-2">
                  <span class="font-medium">{event.title}</span>
                  <span class="text-xl font-bold">{last.count}</span>
                </div>
                <div class="text-xs text-gray-500 text-right">
                  Updated: {new Date(last.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if entrants.length > 0}
    <div class="mb-12">
      <h2 class="text-2xl font-black text-slate-800 mb-6 tracking-tight">Field Strength</h2>
      
      <!-- Mobile Tabs -->
      <div class="lg:hidden">
         <Tabs.Root value="men" class="w-full">
            <Tabs.List class="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
               <Tabs.Trigger value="men" class="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-500 font-bold">Top Men</Tabs.Trigger>
               <Tabs.Trigger value="women" class="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-500 font-bold">Top Women</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="men">
               {@render EntrantList(topMen, "Top Men", "blue")}
            </Tabs.Content>
            <Tabs.Content value="women">
               {@render EntrantList(topWomen, "Top Women", "rose")}
            </Tabs.Content>
         </Tabs.Root>
      </div>

      <!-- Desktop Grid -->
      <div class="hidden lg:grid grid-cols-2 gap-8">
          {@render EntrantList(topMen, "Top Men", "blue")}
          {@render EntrantList(topWomen, "Top Women", "rose")}
      </div>
    </div>
  {/if}

  <!-- Full Waitlist Section -->
  {#if activeEvents.some((e: RaceEvent) => e.data && e.data.length > 0 && e.data[e.data.length - 1].applicants?.length > 0)}
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-6">Waitlist Applicants</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        {#each activeEvents as event}
          {#if event.data && event.data.length > 0}
            {@const last = event.data[event.data.length - 1]}
            {#if last.applicants && last.applicants.length > 0}
              <div class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mt-8">
                <div class="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 class="font-bold text-slate-800 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-orange-500"></span> Waitlist Applicants
                    <span class="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{last.applicants.length} Total</span>
                  </h3>
                  <div class="relative w-full md:w-64">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg class="w-4 h-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      id={`search-${event.id}`} 
                      class="block w-full p-2 ps-10 text-sm text-slate-700 border border-slate-200 rounded-lg bg-white focus:ring-orange-500 focus:border-orange-500" 
                      placeholder="Search applicants..." 
                      bind:value={searchTerms[event.id]}
                    />
                  </div>
                </div>

                <div class="overflow-x-auto max-h-[800px] overflow-y-auto">
                  <table class="w-full text-sm text-left">
                     <thead class="text-xs text-slate-500 uppercase bg-stone-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th class="px-6 py-3 font-semibold w-16 text-center">Pos</th>
                            <th class="px-6 py-3 font-semibold">Name</th>
                            <th class="px-6 py-3 font-semibold text-right">1D</th>
                            <th class="px-6 py-3 font-semibold text-right">7D</th>
                            <th class="px-6 py-3 font-semibold text-right">30D</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-stone-100 bg-white">
                      {#each last.applicants
                        .map((name: string, i: number) => ({ name, i }))
                        .filter((item: { name: string; i: number }) => !searchTerms[event.id] || item.name.toLowerCase().includes(searchTerms[event.id].toLowerCase())) as item}
                        {@const diffs = getPositionDiffs(event.id, item.name, item.i)}
                        <tr class="hover:bg-orange-50/50 transition-colors group">
                            <td class="px-6 py-3 font-mono text-xs text-slate-400 text-center">{item.i + 1}</td>
                            <td class="px-6 py-3 font-medium text-slate-700">
                                <a href={`https://ultrasignup.com/results_participant.aspx?fname=${item.name.split(" ")[0]}&lname=${item.name.split(" ").slice(1).join(" ")}`} target="_blank" rel="noopener noreferrer" class="hover:text-orange-600 hover:underline transition-colors">
                                    {item.name}
                                </a>
                            </td>
                            <td class="px-6 py-3 text-right">{@render ChangeIndicator(diffs.d1)}</td>
                            <td class="px-6 py-3 text-right">{@render ChangeIndicator(diffs.d7)}</td>
                            <td class="px-6 py-3 text-right">{@render ChangeIndicator(diffs.d30)}</td>
                        </tr>
                      {/each}
                     </tbody>
                  </table>
                </div>
              </div>
            {/if}
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
</div>
