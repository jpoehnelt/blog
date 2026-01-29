<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  let { params, data } = $props();

  let year = $derived(params.year);
  let years = $derived(data.years);
  let racesForYear = $derived(data.racesForYear);

  let title = $derived(`${year} Ultra Marathon Races`);
  let description = $derived(
    `Track waitlist movement and statistics for popular ultramarathons in ${year}.`,
  );
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link
    rel="canonical"
    href={`https://justin.poehnelt.com/ultras/races/${year}`}
  />
</svelte:head>

<div class="min-h-screen bg-stone-50 pb-20">
  <!-- Hero Section -->
  <div class="relative bg-slate-900 text-stone-100 overflow-hidden shadow-2xl">
    <!-- Topographic Background Pattern -->
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
               <Breadcrumb.Page class="text-white font-medium">{year}</Breadcrumb.Page>
            </Breadcrumb.Item>
         </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="max-w-4xl">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-semibold tracking-wide border border-orange-600/30">SEASON {year}</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
          Ultra Marathon Races
        </h1>
        <p class="text-lg md:text-xl text-stone-400 max-w-2xl leading-relaxed">
          Tracking entrants and waitlist movement for popular ultramarathons. Select a race below to view detailed statistics.
        </p>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-6 -mt-8 relative z-10 space-y-8">
    <!-- Year Selector -->
    {#if years.length > 0}
      <div class="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-xl inline-flex flex-wrap gap-2">
        {#each years as y}
          <a
            href="/ultras/races/{y}"
            class="px-4 py-2 rounded-xl text-sm font-bold transition-all border
          {y === Number(year)
              ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-900/20'
              : 'bg-slate-700/50 text-stone-400 border-slate-600 hover:bg-slate-700 hover:text-stone-200 hover:border-slate-500'}"
          >
            {y}
          </a>
        {/each}
      </div>
    {/if}

    <!-- Race Grid -->
    {#if racesForYear.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each racesForYear as race}
          <a
            href="/ultras/races/{race.year}/{race.slug}/{race.id}"
            class="group block bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div class="h-32 bg-slate-900 relative overflow-hidden group-hover:bg-slate-800 transition-colors">
               <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
               <div class="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-slate-900/90 to-transparent">
                  <span class="text-xs font-bold text-orange-400 uppercase tracking-widest">{new Date(race.date).getFullYear()}</span>
               </div>
            </div>
            
            <div class="p-6 pt-4">
              <h2 class="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{race.title}</h2> <!-- Fallback title -->
              <div class="flex items-center text-stone-500 text-sm mb-3">
                 <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 {race.location}
              </div>
              {#if race.competitiveness}
                <div class="flex items-center gap-3 text-xs mb-3">
                  <div class="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                    <span class="font-semibold">{race.competitiveness.averageRank.toFixed(0)}</span>
                    <span class="text-purple-500">avg rank</span>
                  </div>
                  {#if race.competitiveness.eliteCount > 0}
                    <div class="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                      <span class="font-semibold">{race.competitiveness.eliteCount}</span>
                      <span class="text-orange-500">elite</span>
                    </div>
                  {/if}
                </div>
              {/if}
              <div class="flex items-center justify-between mt-4 text-sm font-medium pt-4 border-t border-stone-100">
                <span class="text-stone-400">{new Date(race.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                <span class="text-orange-600 flex items-center group-hover:translate-x-1 transition-transform">
                  View Events <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div class="p-12 text-center border-2 border-dashed border-stone-300 rounded-2xl bg-white/50">
        <p class="text-stone-500 text-lg">
          No races found for {year}.
        </p>
      </div>
    {/if}

    <div class="mt-12 pt-8 border-t border-stone-200 text-sm text-stone-500 text-center">
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
