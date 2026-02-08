<script lang="ts">
  import {
    raceYearUrl,
    raceEventUrl,
    absoluteRaceYearUrl,
    absoluteRaceEventUrl,
  } from "$lib/race-urls";
  import RaceYearNav from "$lib/components/race/RaceYearNav.svelte";
  import { RankingsMethodology } from "$lib/components/race";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table";
  import {
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
  } from "@tanstack/table-core";

  let { params, data } = $props();

  let year = $derived(params.year);
  let years = $derived(data.years);
  let eventsForYear = $derived(data.eventsForYear);

  // View mode state
  let viewMode = $state<"card" | "table">("table");

  // TanStack Table sorting state
  let sorting = $state<SortingState>([{ id: "date", desc: false }]);
  let globalFilter = $state("");

  // Column definitions
  const columns: ColumnDef<any>[] = [
    {
      id: "title",
      accessorKey: "title",
      header: "Race",
      cell: ({ row }) => row.original.title,
      enableSorting: true,
    },
    {
      id: "location",
      accessorKey: "location",
      header: "Location",
      enableSorting: true,
    },
    {
      id: "date",
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      },
      sortingFn: (rowA, rowB) => {
        return (
          new Date(rowA.original.date).getTime() -
          new Date(rowB.original.date).getTime()
        );
      },
      enableSorting: true,
    },
    {
      id: "averageRank",
      accessorFn: (row) => row.competitiveness?.averageRank ?? 0,
      header: "Avg Rank",
      cell: ({ row }) =>
        row.original.competitiveness?.averageRank?.toFixed(0) ?? null,
      enableSorting: true,
    },
    {
      id: "eliteCount",
      accessorFn: (row) => row.competitiveness?.eliteCount ?? 0,
      header: "Elites",
      cell: ({ row }) => row.original.competitiveness?.eliteCount ?? null,
      enableSorting: true,
    },
  ];

  // Create the table instance
  let table = $derived(
    createSvelteTable({
      data: eventsForYear,
      columns,
      state: {
        sorting,
        globalFilter,
      },
      onSortingChange: (updater) => {
        sorting = typeof updater === "function" ? updater(sorting) : updater;
      },
      onGlobalFilterChange: (updater) => {
        globalFilter =
          typeof updater === "function" ? updater(globalFilter) : updater;
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      globalFilterFn: (row, _columnId, filterValue) => {
        const query = filterValue.toLowerCase();
        return (
          row.original.title?.toLowerCase().includes(query) ||
          row.original.location?.toLowerCase().includes(query)
        );
      },
    }),
  );

  let title = $derived(`${year} Ultra Marathon Races | Waitlist Tracker`);
  let description = $derived(
    `Track waitlist movement and statistics for popular ultramarathons in ${year}.`,
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
          name: "Races",
          item: "https://justin.poehnelt.com/ultras/races",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: year,
          item: absoluteRaceYearUrl(year),
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${year} Ultra Marathon Races`,
      description: description,
      numberOfItems: eventsForYear.length,
      itemListElement: eventsForYear.map((race: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        name: race.title,
        url: absoluteRaceEventUrl({
          year: race.year,
          slug: race.slug,
          raceId: race.raceId,
          eventId: race.eventId,
        }),
      })),
    },
  ]);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={absoluteRaceYearUrl(year)} />
  {#each jsonLd as ld}
    {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
  {/each}
</svelte:head>

<div class="min-h-screen bg-stone-50 pb-20">
  <!-- Hero Section -->
  <div
    class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-stone-100 overflow-hidden shadow-2xl"
  >
    <!-- Topographic Contour Pattern - Mountain Lines -->
    <div class="absolute inset-0 opacity-[0.07]">
      <svg
        class="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 800 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="text-white"
        >
          <!-- Contour lines evoking mountain terrain -->
          <path d="M-50,350 Q100,300 200,320 T400,280 T600,310 T850,270" />
          <path d="M-50,300 Q80,250 180,270 T380,220 T580,250 T850,200" />
          <path d="M-50,250 Q60,180 200,210 T420,150 T620,190 T850,130" />
          <path d="M-50,200 Q120,140 250,160 T450,100 T650,140 T850,80" />
          <path d="M-50,150 Q100,80 220,110 T460,50 T680,90 T850,30" />
          <path d="M-50,100 Q80,40 200,60 T440,10 T660,40 T850,-20" />
          <!-- Additional detail lines -->
          <path
            d="M-50,325 Q90,280 190,300 T390,250 T590,280 T850,240"
            opacity="0.5"
          />
          <path
            d="M-50,275 Q70,210 190,240 T400,180 T600,220 T850,160"
            opacity="0.5"
          />
          <path
            d="M-50,175 Q110,100 230,130 T455,70 T665,110 T850,50"
            opacity="0.5"
          />
        </g>
      </svg>
    </div>

    <!-- Gradient overlays for depth -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"
    ></div>
    <div
      class="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-slate-900/40"
    ></div>

    <!-- Accent glow -->
    <div
      class="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"
    ></div>

    <div class="relative container mx-auto px-6 py-16 md:py-24">
      <Breadcrumb.Root class="mb-6">
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link
              href="/"
              class="text-stone-400 hover:text-white transition-colors"
              >Home</Breadcrumb.Link
            >
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="text-stone-600" />
          <Breadcrumb.Item>
            <Breadcrumb.Link
              href="/ultras/races"
              class="text-stone-400 hover:text-white transition-colors"
              >Races</Breadcrumb.Link
            >
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="text-stone-600" />
          <Breadcrumb.Item>
            <Breadcrumb.Page class="text-white font-medium"
              >{year}</Breadcrumb.Page
            >
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="max-w-4xl">
        <div class="flex items-center gap-3 mb-4">
          <span
            class="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-semibold tracking-wide border border-orange-600/30"
            >SEASON {year}</span
          >
        </div>
        <h1
          class="text-4xl md:text-6xl font-black tracking-tight text-white mb-6"
        >
          Ultra Marathon Races
        </h1>
        <p class="text-lg md:text-xl text-stone-400 max-w-2xl leading-relaxed">
          Tracking entrants and waitlist movement for popular ultramarathons.
          Select a race below to view detailed statistics.
        </p>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-6 -mt-8 relative z-10 space-y-8">
    <!-- Year Selector -->
    <RaceYearNav {years} activeYear={year} />

    <!-- Search & Sort Controls -->
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Search Box -->
      <div class="relative flex-1">
        <div
          class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
        >
          <svg
            class="h-5 w-5 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          bind:value={globalFilter}
          placeholder="Search races by name or location..."
          class="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-stone-900 placeholder:text-stone-400"
        />
        {#if globalFilter}
          <button
            type="button"
            onclick={() => (globalFilter = "")}
            aria-label="Clear search"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        {/if}
      </div>

      <!-- View Toggle -->
      <div class="flex items-center gap-1 bg-stone-100 p-1 rounded-xl ml-2">
        <button
          type="button"
          onclick={() => (viewMode = "card")}
          class="p-2.5 rounded-lg transition-all {viewMode === 'card'
            ? 'bg-orange-600 text-white shadow-sm'
            : 'text-stone-400 hover:text-stone-600'}"
          title="Card view"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>
        <button
          type="button"
          onclick={() => (viewMode = "table")}
          class="p-2.5 rounded-lg transition-all {viewMode === 'table'
            ? 'bg-orange-600 text-white shadow-sm'
            : 'text-stone-400 hover:text-stone-600'}"
          title="Table view"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Race Display -->
    {#if table.getRowModel().rows.length > 0}
      {#if viewMode === "table"}
        <!-- TanStack Table View -->
        <div
          class="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
        >
          <table class="w-full">
            <thead class="bg-stone-50 border-b border-stone-200">
              {#each table.getHeaderGroups() as headerGroup}
                <tr>
                  {#each headerGroup.headers as header}
                    <th
                      class="text-left px-6 py-4 {header.id === 'location'
                        ? 'hidden sm:table-cell'
                        : ''} {header.id === 'averageRank' ||
                      header.id === 'eliteCount'
                        ? 'hidden md:table-cell text-center'
                        : ''}"
                    >
                      {#if header.column.getCanSort()}
                        <button
                          onclick={() => header.column.toggleSorting()}
                          class="text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-1 {header.column.getIsSorted()
                            ? 'text-orange-600'
                            : 'text-stone-500 hover:text-stone-700'}"
                        >
                          <FlexRender
                            content={header.column.columnDef.header}
                            context={header.getContext()}
                          />
                          {#if header.column.getIsSorted() === "asc"}
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          {:else if header.column.getIsSorted() === "desc"}
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          {:else}
                            <svg
                              class="w-4 h-4 opacity-30"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              />
                            </svg>
                          {/if}
                        </button>
                      {:else}
                        <span
                          class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
                        >
                          <FlexRender
                            content={header.column.columnDef.header}
                            context={header.getContext()}
                          />
                        </span>
                      {/if}
                    </th>
                  {/each}
                  <th class="px-6 py-4"></th>
                </tr>
              {/each}
            </thead>
            <tbody class="divide-y divide-stone-100">
              {#each table.getRowModel().rows as row}
                <tr class="hover:bg-stone-50 transition-colors">
                  <td class="px-6 py-4">
                    <a
                      href={raceEventUrl({
                        year: row.original.year,
                        slug: row.original.slug,
                        raceId: row.original.raceId,
                        eventId: row.original.eventId,
                      })}
                      class="font-semibold text-slate-900 hover:text-orange-600 transition-colors"
                    >
                      {row.original.title}
                    </a>
                  </td>
                  <td
                    class="px-6 py-4 text-stone-500 text-sm hidden sm:table-cell"
                    >{row.original.location}</td
                  >
                  <td class="px-6 py-4 text-stone-500 text-sm"
                    >{new Date(row.original.date).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )}</td
                  >
                  <td class="px-6 py-4 text-center hidden md:table-cell">
                    {#if row.original.competitiveness}
                      <span
                        class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold"
                      >
                        {row.original.competitiveness.averageRank.toFixed(0)}
                      </span>
                    {:else}
                      <span class="text-stone-300">—</span>
                    {/if}
                  </td>
                  <td class="px-6 py-4 text-center hidden md:table-cell">
                    {#if row.original.competitiveness?.eliteCount > 0}
                      <span
                        class="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold"
                      >
                        {row.original.competitiveness.eliteCount}
                      </span>
                    {:else}
                      <span class="text-stone-300">—</span>
                    {/if}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <a
                      href={raceEventUrl({
                        year: row.original.year,
                        slug: row.original.slug,
                        raceId: row.original.raceId,
                        eventId: row.original.eventId,
                      })}
                      class="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      View →
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <!-- Card Grid View -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each table.getRowModel().rows as row}
            {@const race = row.original}
            <a
              href={raceEventUrl({
                year: race.year,
                slug: race.slug,
                raceId: race.raceId,
                eventId: race.eventId,
              })}
              class="group block bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                class="h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden group-hover:from-slate-800 group-hover:via-slate-700 group-hover:to-slate-800 transition-all duration-300"
              >
                <!-- Topographic contour pattern -->
                <div class="absolute inset-0 opacity-[0.08]">
                  <svg
                    class="w-full h-full"
                    preserveAspectRatio="xMidYMid slice"
                    viewBox="0 0 200 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-width="0.8"
                      class="text-white"
                    >
                      <path d="M-10,90 Q30,70 60,80 T120,65 T180,75 T210,60" />
                      <path d="M-10,70 Q25,50 55,60 T115,45 T175,55 T210,40" />
                      <path d="M-10,50 Q20,30 50,40 T110,25 T170,35 T210,20" />
                      <path d="M-10,30 Q30,10 60,20 T120,5 T180,15 T210,0" />
                    </g>
                  </svg>
                </div>
                <!-- Subtle glow -->
                <div
                  class="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"
                ></div>
                <div
                  class="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-slate-900/90 to-transparent"
                >
                  <span
                    class="text-xs font-bold text-orange-400 uppercase tracking-widest"
                    >{new Date(race.date).getFullYear()}</span
                  >
                </div>
              </div>

              <div class="p-6 pt-4">
                <h2
                  class="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors"
                >
                  {race.title}
                </h2>
                <div class="flex items-center text-stone-500 text-sm mb-3">
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path><path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path></svg
                  >
                  {race.location}
                </div>
                {#if race.competitiveness}
                  <div class="flex items-center gap-3 text-xs mb-3">
                    <div
                      class="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                    >
                      <svg
                        class="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        ><path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        /></svg
                      >
                      <span class="font-semibold"
                        >{race.competitiveness.averageRank.toFixed(0)}</span
                      >
                      <span class="text-purple-500">avg rank</span>
                    </div>
                    {#if race.competitiveness.eliteCount > 0}
                      <div
                        class="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full"
                      >
                        <span class="font-semibold"
                          >{race.competitiveness.eliteCount}</span
                        >
                        <span class="text-orange-500">elite</span>
                      </div>
                    {/if}
                  </div>
                {/if}
                <div
                  class="flex items-center justify-between mt-4 text-sm font-medium pt-4 border-t border-stone-100"
                >
                  <span class="text-stone-400"
                    >{new Date(race.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}</span
                  >
                  <span
                    class="text-orange-600 flex items-center group-hover:translate-x-1 transition-transform"
                  >
                    View Events <svg
                      class="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      ></path></svg
                    >
                  </span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    {:else}
      <div
        class="p-12 text-center border-2 border-dashed border-stone-300 rounded-2xl bg-white/50"
      >
        <p class="text-stone-500 text-lg">
          No races found for {year}.
        </p>
      </div>
    {/if}

    <RankingsMethodology variant="card" />

    <div
      class="mt-12 pt-8 border-t border-stone-200 text-sm text-stone-500 text-center"
    >
      <p>
        These stats are tracked automatically. If you'd like to add a race,
        <a
          href="https://github.com/jpoehnelt/blog"
          class="text-orange-600 hover:text-orange-700 font-medium underline decoration-orange-600/30 hover:decoration-orange-600"
          target="_blank"
          rel="noreferrer">open an issue</a
        >.
      </p>
    </div>
  </div>
</div>
