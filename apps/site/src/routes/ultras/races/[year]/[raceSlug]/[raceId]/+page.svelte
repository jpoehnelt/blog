<script>
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  let { data } = $props();
  let race = $derived(data.race);

  let title = $derived(`${race.year} ${race.title} - Event Selection`);
  let description = $derived(
    `Select an event distance for the ${race.year} ${race.title} in ${race.location}. View waitlist stats and entrant information for all available distances.`
  );
  let canonicalUrl = $derived(
    `https://justin.poehnelt.com/ultras/races/${race.year}/${race.slug}/${race.id}`
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
          name: race.year,
          item: `https://justin.poehnelt.com/ultras/races/${race.year}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: race.title,
          item: canonicalUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${race.title} ${race.year}`,
      startDate: race.date || race.year,
      location: {
        "@type": "Place",
        name: race.location || "TBD",
      },
      description: description,
      url: canonicalUrl,
    },
  ]);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  {#each jsonLd as ld}
    {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
  {/each}
</svelte:head>

<div class="min-h-screen bg-stone-50 pb-20">
  <!-- Hero Section -->
  <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-stone-100 overflow-hidden shadow-2xl">
    <!-- Topographic Contour Pattern - Mountain Lines -->
    <div class="absolute inset-0 opacity-[0.07]">
      <svg class="w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
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
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-slate-900/40"></div>
    
    <!-- Accent glow -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
    <div class="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
    
    <div class="relative container mx-auto px-6 py-16 md:py-24">
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
               <Breadcrumb.Page class="text-white font-medium">{race.title}</Breadcrumb.Page>
            </Breadcrumb.Item>
         </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="max-w-4xl">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-semibold tracking-wide border border-orange-600/30">EVENT SELECTION</span>
           <span class="text-stone-400 text-sm font-medium tracking-wide uppercase">{race.date ? new Date(race.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : race.year}</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
          {race.title}
        </h1>
        <div class="flex items-center text-stone-300 gap-2 mb-2 text-xl">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           <span class="font-medium">{race.location}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-6 -mt-8 relative z-10 space-y-8">
    <!-- Event Selection Grid -->
    <div class="bg-white rounded-2xl p-8 border border-stone-200 shadow-lg">
        <h2 class="text-2xl font-black text-slate-800 mb-6 tracking-tight">Select an Event</h2>
        
        {#if race.events && race.events.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each race.events as event}
                    <a href="/ultras/races/{race.year}/{race.slug}/{race.id}/{event.id}" class="group block bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div class="p-8">
                            <h3 class="text-2xl font-black text-slate-800 mb-6 group-hover:text-orange-600 transition-colors">{event.title}</h3>
                            
                            <div class="flex gap-4 text-sm mb-4">
                                {#if event.stats}
                                    <div class="flex flex-col items-center bg-stone-50 p-3 rounded-xl border border-stone-100 min-w-[80px]">
                                        <span class="font-black text-xl text-slate-900">{event.stats.waitlist}</span>
                                        <span class="text-[10px] uppercase tracking-widest text-stone-500 font-bold mt-1">Waitlist</span>
                                    </div>
                                    <div class="flex flex-col items-center bg-stone-50 p-3 rounded-xl border border-stone-100 min-w-[80px]">
                                        <span class="font-black text-xl text-slate-900">{event.stats.entrants}</span>
                                        <span class="text-[10px] uppercase tracking-widest text-stone-500 font-bold mt-1">Entrants</span>
                                    </div>
                                {:else}
                                    <span class="text-stone-400 italic">No stats available</span>
                                {/if}
                            </div>
                            
                            {#if event.competitiveness}
                              <div class="flex items-center gap-3 text-xs mb-4">
                                <div class="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100">
                                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                                  <span class="font-bold">{event.competitiveness.averageRank.toFixed(0)}</span>
                                  <span class="text-purple-500 font-medium">avg rank</span>
                                </div>
                                {#if event.competitiveness.eliteCount > 0}
                                  <div class="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100">
                                    <span class="font-bold">{event.competitiveness.eliteCount}</span>
                                    <span class="text-orange-500 font-medium">elite</span>
                                  </div>
                                {/if}
                              </div>
                            {/if}
          
                            <div class="flex items-center justify-between pt-6 border-t border-stone-100">
                                <span class="text-stone-400 text-xs font-bold uppercase tracking-wide">View Dashboard</span>
                                <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {:else}
            <div class="p-12 text-center border-2 border-dashed border-stone-300 rounded-2xl bg-white/50">
                <p class="text-stone-500 text-lg">
                    No active events found for this race.
                </p>
            </div>
        {/if}
    </div>
  </div>
</div>
