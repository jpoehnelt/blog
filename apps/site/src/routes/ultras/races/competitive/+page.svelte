<script lang="ts">
  import { raceEventUrl, absoluteRaceEventUrl } from "$lib/race-urls";
  import RaceYearNav from "$lib/components/race/RaceYearNav.svelte";
  import { RankingsMethodology } from "$lib/components/race";
  import RankResultsScatter from "$lib/components/race/RankResultsScatter.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table";
  import {
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type SortingState,
  } from "@tanstack/table-core";

  import type { CompetitiveEvent } from "./+page.server";

  let { data } = $props();
  let races = $derived(data.races);
  let years = $derived(data.years);
  let scatterData = $derived(data.scatterData);

  // TanStack Table sorting state - default sort by elite count descending
  let sorting = $state<SortingState>([{ id: "top20Rank", desc: true }]);
  let globalFilter = $state("");

  // Column definitions
  const columns: ColumnDef<CompetitiveEvent>[] = [
    {
      id: "title",
      accessorKey: "fullTitle",
      header: "Race",
      cell: ({ row }) => row.original.fullTitle,
      enableSorting: true,
    },
    {
      id: "year",
      accessorKey: "year",
      header: "Year",
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
      id: "eliteCount",
      accessorFn: (row) => row.competitiveness?.eliteCount ?? 0,
      header: "Elites",
      cell: ({ row }) => row.original.competitiveness?.eliteCount ?? 0,
      enableSorting: true,
    },
    {
      id: "top20Rank",
      accessorFn: (row) => row.competitiveness?.top20Rank ?? 0,
      header: "Top 20 Rank",
      cell: ({ row }) =>
        row.original.competitiveness?.top20Rank
          ? row.original.competitiveness.top20Rank.toFixed(1) + "%"
          : "—",
      enableSorting: true,
    },
    {
      id: "elitePercent",
      accessorFn: (row) => {
        const ranked = row.competitiveness?.rankedEntrants ?? 0;
        const elite = row.competitiveness?.eliteCount ?? 0;
        return ranked > 0 ? (elite / ranked) * 100 : 0;
      },
      header: "Elite %",
      cell: ({ row }) => {
        const ranked = row.original.competitiveness?.rankedEntrants ?? 0;
        const elite = row.original.competitiveness?.eliteCount ?? 0;
        const percent = ranked > 0 ? (elite / ranked) * 100 : 0;
        return percent > 0 ? percent.toFixed(1) + "%" : "—";
      },
      enableSorting: true,
    },
  ];

  // Create the table instance
  let table = $derived(
    createSvelteTable({
      data: races,
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
          row.original.fullTitle?.toLowerCase().includes(query) ||
          row.original.location?.toLowerCase().includes(query) ||
          String(row.original.year).includes(query)
        );
      },
    }),
  );

  let title = "Most Competitive Ultra Marathons | Elite Runner Rankings";
  let description =
    "Discover the most competitive ultramarathon races in the United States ranked by elite runner participation. Find races with 10+ elite runners (UltraSignup rank ≥ 90) and compare field strength across events.";

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
          name: "Competitive",
          item: "https://justin.poehnelt.com/ultras/races/competitive",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Most Competitive Ultramarathons",
      description: description,
      numberOfItems: races.length,
      itemListElement: races
        .slice(0, 20)
        .map((race: CompetitiveEvent, index: number) => ({
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
  <meta
    name="keywords"
    content="competitive ultramarathon, elite ultra runners, best ultramarathon fields, top ultra races, UltraSignup rankings"
  />
  <link
    rel="canonical"
    href="https://justin.poehnelt.com/ultras/races/competitive"
  />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content="https://justin.poehnelt.com/ultras/races/competitive"
  />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#each jsonLd as ld}
    {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
  {/each}
</svelte:head>

<div class="min-h-screen bg-stone-50 pb-20">
  <!-- Hero Section -->
  <div
    class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-stone-100 overflow-hidden shadow-2xl"
  >
    <!-- Topographic Contour Pattern -->
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
          <path d="M-50,350 Q100,300 200,320 T400,280 T600,310 T850,270" />
          <path d="M-50,300 Q80,250 180,270 T380,220 T580,250 T850,200" />
          <path d="M-50,250 Q60,180 200,210 T420,150 T620,190 T850,130" />
          <path d="M-50,200 Q120,140 250,160 T450,100 T650,140 T850,80" />
          <path d="M-50,150 Q100,80 220,110 T460,50 T680,90 T850,30" />
        </g>
      </svg>
    </div>

    <!-- Gradient overlays -->
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
              >Competitive</Breadcrumb.Page
            >
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="max-w-4xl">
        <div class="flex items-center gap-3 mb-4">
          <span
            class="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-semibold tracking-wide border border-orange-600/30"
            >ALL YEARS</span
          >
        </div>
        <h1
          class="text-4xl md:text-6xl font-black tracking-tight text-white mb-6"
        >
          Most Competitive Ultras
        </h1>
        <p class="text-lg md:text-xl text-stone-400 max-w-2xl leading-relaxed">
          Ranking ultramarathons by elite participation—click any column to
          sort.
        </p>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-6 -mt-8 relative z-10 space-y-8">
    <!-- Year Selector -->
    <RaceYearNav {years} activeCompetitive />

    <!-- Search Box -->
    <div class="relative max-w-md">
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
        placeholder="Search races..."
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
    <!-- Rankings Discussion + Scatter Plot -->
    <div class="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left: Discussion -->
        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-3">
            About Rankings &amp; Methodology
          </h2>
          <div class="space-y-3 text-stone-600 text-sm leading-relaxed">
            <p>
              Rankings are based on <a
                href="https://ultrasignup.com"
                target="_blank"
                rel="noopener"
                class="text-orange-600 hover:text-orange-700 font-medium"
                >UltraSignup</a
              >
              runner rankings. Only runners with
              <strong>5 or more finishes</strong> are included to ensure meaningful
              rankings.
            </p>
            <p>
              An "elite" runner has a rank of <strong>90 or higher</strong
              >—approximately the top 10% of ultra runners. "Field Strength" is
              the rank of the 20th strongest qualified runner—a higher value
              indicates greater depth of talent.
            </p>
            <p>
              The scatter plot shows the relationship between a runner's rank
              and their number of UltraSignup finishes across all tracked
              events. Runners with more experience tend to have more stable,
              higher rankings.
            </p>
            <div class="pt-2 text-xs text-stone-500">
              90+ = Elite • 80-89 = Strong • 60-79 = Experienced • &lt;60 =
              Developing
            </div>
          </div>
        </div>

        <!-- Right: Scatter Plot -->
        <div>
          <h3 class="text-sm font-semibold text-slate-700 mb-1">
            Rank vs. Race Experience
          </h3>
          <p class="text-xs text-stone-400 mb-2">
            Each dot = one runner across all tracked events
          </p>
          <div class="flex gap-4 mb-2 text-xs text-stone-500">
            <span class="flex items-center gap-1.5">
              <span
                class="w-2.5 h-2.5 rounded-full bg-purple-500/60 border border-purple-700/80"
              ></span>
              Elite (90+)
            </span>
            <span class="flex items-center gap-1.5">
              <span
                class="w-2.5 h-2.5 rounded-full bg-stone-400/30 border border-stone-500/40"
              ></span>
              Other
            </span>
          </div>
          {#if scatterData && scatterData.length > 0}
            <RankResultsScatter data={scatterData} />
          {:else}
            <div
              class="h-[380px] flex items-center justify-center text-stone-400 text-sm"
            >
              Loading chart data...
            </div>
          {/if}
        </div>
      </div>
    </div>

    <ins
      class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-1251836334060830"
      data-ad-slot="8468844777"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>

    <!-- Results count -->
    <div class="text-sm text-stone-500">
      Showing {table.getRowModel().rows.length} competitive races
    </div>

    <!-- Table View -->
    {#if table.getRowModel().rows.length > 0}
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
                      ? 'hidden lg:table-cell'
                      : ''} {header.id === 'rankedEntrants'
                      ? 'hidden xl:table-cell'
                      : ''} {[
                      'eliteCount',
                      'top20Rank',
                      'rankedEntrants',
                    ].includes(header.id)
                      ? 'text-center'
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
                    {row.original.fullTitle}
                  </a>
                </td>
                <td class="px-6 py-4 text-stone-500 text-sm"
                  >{row.original.year}</td
                >
                <td
                  class="px-6 py-4 text-stone-500 text-sm hidden lg:table-cell"
                  >{row.original.location}</td
                >
                <td class="px-6 py-4 text-stone-500 text-sm"
                  >{new Date(row.original.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}</td
                >
                <td class="px-6 py-4 text-center">
                  <span
                    class="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {row.original.competitiveness?.eliteCount ?? 0}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span
                    class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {row.original.competitiveness?.top20Rank
                      ? row.original.competitiveness.top20Rank.toFixed(1) + "%"
                      : "—"}
                  </span>
                </td>
                <td class="px-6 py-4 text-center hidden xl:table-cell">
                  <span class="text-stone-500 text-sm">
                    {#if (row.original.competitiveness?.rankedEntrants ?? 0) > 0}
                      {(
                        ((row.original.competitiveness?.eliteCount ?? 0) /
                          (row.original.competitiveness?.rankedEntrants ?? 1)) *
                        100
                      ).toFixed(1)}%
                    {:else}
                      —
                    {/if}
                  </span>
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
      <div
        class="p-12 text-center border-2 border-dashed border-stone-300 rounded-2xl bg-white/50"
      >
        <p class="text-stone-500 text-lg">No competitive races found.</p>
      </div>
    {/if}

    <div
      class="mt-12 pt-8 border-t border-stone-200 text-sm text-stone-500 text-center"
    >
      <p>
        Races are ranked by elite count (runners with rank ≥ 90).
        <a
          href="/ultras/races"
          class="text-orange-600 hover:text-orange-700 font-medium underline decoration-orange-600/30 hover:decoration-orange-600"
          >Browse by year</a
        >
      </p>
    </div>
  </div>
</div>
