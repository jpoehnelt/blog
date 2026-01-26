<script lang="ts">
  import WaitlistChart from "$lib/components/WaitlistChart.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";

  interface Entrant {
     firstName: string;
     lastName: string;
     city: string;
     state: string;
     age: string;
     rank: number;
     results: number;
     eventTitle?: string;
  }

  interface EventData {
      date: string;
      count: number;
      applicants: string[];
  }

  interface RaceEvent {
      title: string;
      id: string;
      entrants?: Entrant[];
      data?: EventData[];
  }

  interface Race {
      id: string;
      year: string;
      slug: string;
      name: string;
      date: string;
      location: string;
  }

  let { data } = $props<{ data: { race: Race; events: RaceEvent[] } }>();

  let race = $derived(data.race);
  let events = $derived(data.events || []);

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

      const isHighPerformer = rank > 85 && results > 5;
      const isQualified = results >= 5;

      // Always include high performers (>90% rank & >5 results)
      // OR if we haven't reached our quota of 5 qualified runners yet
      if (isHighPerformer || count < 5) {
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
        name: `${athlete.city}, ${athlete.state}`,
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
    class={`text-xs font-mono w-8 text-center ${diff === 0 || diff === null ? "text-gray-300" : diff > 0 ? "text-green-600" : "text-red-500"}`}
  >
    {#if diff === null || diff === 0}
      -
    {:else if diff > 0}
      ▲{diff}
    {:else}
      ▼{Math.abs(diff)}
    {/if}
  </div>
{/snippet}

<svelte:head>
  <title>{race.year} {race.name} Waitlist Analysis</title>
  {#each athleteJsonLd as ld}
    {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
  {/each}
</svelte:head>

<div class="container mx-auto p-4 w-full max-w-6xl">
  <!-- Breadcrumbs -->
  <nav class="flex text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li class="inline-flex items-center">
        <a href="/" class="hover:text-gray-900">Home</a>
      </li>
      <li>
        <div class="flex items-center">
          <svg
            class="w-3 h-3 text-gray-400 mx-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <a href="/ultras/races/{race.year}" class="hover:text-gray-900"
            >{race.year} Waitlists</a
          >
        </div>
      </li>
      <li>
        <div class="flex items-center">
          <svg
            class="w-3 h-3 text-gray-400 mx-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <a
            href="/ultras/races/{race.year}/{race.slug}"
            class="hover:text-gray-900">{race.name}</a
          >
        </div>
      </li>
      <li aria-current="page">
        <div class="flex items-center">
          <svg
            class="w-3 h-3 text-gray-400 mx-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span class="text-gray-900"
            >{activeEvents[0]?.title || race.name}</span
          >
        </div>
      </li>
    </ol>
  </nav>

  <h1 class="text-3xl font-bold mb-2">{race.year} {race.name}</h1>
  <div class="text-xl text-gray-600 mb-8">{race.location}</div>

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
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Top Entrants</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Men -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium mb-4 text-blue-800">Top Men</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th class="px-3 py-2">Rank</th>
                  <th class="px-3 py-2">Name</th>
                  <th class="px-3 py-2">Results</th>
                  <th class="px-3 py-2">Loc</th>
                </tr>
              </thead>
              <tbody>
                {#each topMen as m}
                  <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-2 font-medium">{m.rank}%</td>
                    <td class="px-3 py-2">
                      <div class="font-medium">{m.firstName} {m.lastName}</div>
                      <div class="text-xs text-gray-500">{m.age}</div>
                    </td>
                    <td
                      class="px-3 py-2 {m.results < 5
                        ? 'text-orange-500 font-bold'
                        : ''}"
                      title={m.results < 5 ? "Low result count" : ""}
                      >{m.results}</td
                    >
                    <td class="px-3 py-2 text-xs">{m.city}, {m.state}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Women -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium mb-4 text-pink-800">Top Women</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th class="px-3 py-2">Rank</th>
                  <th class="px-3 py-2">Name</th>
                  <th class="px-3 py-2">Results</th>
                  <th class="px-3 py-2">Loc</th>
                </tr>
              </thead>
              <tbody>
                {#each topWomen as w}
                  <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-2 font-medium">{w.rank}%</td>
                    <td class="px-3 py-2">
                      <div class="font-medium">{w.firstName} {w.lastName}</div>
                      <div class="text-xs text-gray-500">{w.age}</div>
                    </td>
                    <td
                      class="px-3 py-2 {w.results < 5
                        ? 'text-orange-500 font-bold'
                        : ''}"
                      title={w.results < 5 ? "Low result count" : ""}
                      >{w.results}</td
                    >
                    <td class="px-3 py-2 text-xs">{w.city}, {w.state}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
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
              <div class="bg-white p-6 rounded-lg shadow">
                <h3
                  class="text-lg font-medium mb-4 sticky top-0 bg-white py-2 border-b z-10"
                >
                  {event.title}
                  <span class="text-gray-500 text-sm font-normal"
                    >({last.applicants.length})</span
                  >
                </h3>

                <!-- Header -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 px-2 gap-2 sticky top-[45px] bg-white z-10 pt-2 border-b pb-2">
                  <div class="relative w-full md:w-64">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      id={`search-${event.id}`} 
                      class="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Search applicant..." 
                      bind:value={searchTerms[event.id]}
                    />
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-sm text-left">
                     <thead class="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            <th class="px-3 py-2 w-12">Pos</th>
                            <th class="px-3 py-2">Name</th>
                            <th class="px-3 py-2 text-right">1D</th>
                            <th class="px-3 py-2 text-right">1W</th>
                            <th class="px-3 py-2 text-right">1M</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-gray-100">
                      {#each last.applicants
                        .map((name: string, i: number) => ({ name, i }))
                        .filter((item: { name: string; i: number }) => !searchTerms[event.id] || item.name.toLowerCase().includes(searchTerms[event.id].toLowerCase())) as item}
                        {@const diffs = getPositionDiffs(event.id, item.name, item.i)}
                        <tr class="hover:bg-gray-50">
                            <td class="px-3 py-2 font-mono text-xs text-gray-500">{item.i + 1}</td>
                            <td class="px-3 py-2 font-medium">
                                <a href={`https://ultrasignup.com/results_participant.aspx?fname=${item.name.split(" ")[0]}&lname=${item.name.split(" ").slice(1).join(" ")}`} target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 hover:underline">
                                    {item.name}
                                </a>
                            </td>
                            <td class="px-3 py-2 text-right">{@render ChangeIndicator(diffs.d1)}</td>
                            <td class="px-3 py-2 text-right">{@render ChangeIndicator(diffs.d7)}</td>
                            <td class="px-3 py-2 text-right">{@render ChangeIndicator(diffs.d30)}</td>
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

<style>
  /* Custom Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
