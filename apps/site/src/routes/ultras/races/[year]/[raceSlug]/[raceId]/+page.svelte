<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { extractYouTubeId, isYouTubeUrl } from "$lib/utils/youtube";
  let { data } = $props();
  let race = $derived(data.race);
  let enrichment = $derived(data.enrichment);

  let title = $derived(`${race.year} ${race.title} | Ultra Marathon Race`);
  let description = $derived(
    enrichment?.summary || `Comprehensive race information for the ${race.year} ${race.title} in ${race.location}. View course details, athlete insights, videos, and event distances.`
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
      ...(enrichment?.uniqueFeatures && {
        additionalProperty: enrichment.uniqueFeatures.map((f, i) => ({
          "@type": "PropertyValue",
          name: `Feature ${i + 1}`,
          value: f
        }))
      }),
      ...(enrichment?.videos && enrichment.videos.length > 0 && {
        subjectOf: enrichment.videos.map(v => ({
          "@type": "VideoObject",
          name: v.title,
          url: v.url
        }))
      })
    },
  ]);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  
  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:site_name" content="Justin Poehnelt" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  
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
          <span class="text-stone-400 text-sm font-medium tracking-wide uppercase">{race.date ? new Date(race.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : race.year}</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
          {race.title}
        </h1>
        <div class="flex items-center text-stone-300 gap-2 mb-6 text-xl">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
           <span class="font-medium">{race.location}</span>
        </div>
        
        <!-- Compact Distance Buttons -->
        {#if race.events && race.events.length > 0}
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-stone-400 text-xs font-bold uppercase tracking-wider">Distances:</span>
            {#each race.events as event}
              <a href="/ultras/races/{race.year}/{race.slug}/{race.id}/{event.id}" 
                 class="px-4 py-1.5 rounded-full bg-slate-700/50 border border-slate-500/50 text-white text-sm font-bold uppercase tracking-wide hover:bg-orange-600 hover:border-orange-500 transition-all">
                {event.title}
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="container mx-auto px-6 -mt-8 relative z-10 space-y-8">

    <!-- Enrichment Sections -->
    {#if enrichment}
      <!-- Race Summary -->
      {#if enrichment.summary}
        <div class="bg-white rounded-2xl p-8 border border-stone-200 shadow-lg">
          <h2 class="text-2xl font-black text-slate-800 mb-4 tracking-tight">About This Race</h2>
          <p class="text-stone-600 leading-relaxed text-lg">{enrichment.summary}</p>
          
          {#if enrichment.uniqueFeatures && enrichment.uniqueFeatures.length > 0}
            <div class="mt-6 pt-6 border-t border-stone-100">
              <h3 class="text-sm font-bold text-stone-500 uppercase tracking-wide mb-3">What Makes It Unique</h3>
              <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each enrichment.uniqueFeatures as feature}
                  <li class="flex items-start gap-2 text-stone-600">
                    <svg class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                    {feature}
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

        </div>
      {/if}

      <!-- Compact Event Cards (moved up) -->
      {#if race.events && race.events.length > 0}
        <div class="flex flex-wrap gap-3">
          {#each race.events as event}
            <a href="/ultras/races/{race.year}/{race.slug}/{race.id}/{event.id}" class="group flex items-center gap-4 bg-white rounded-xl px-4 py-3 border border-stone-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all">
              <h3 class="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{event.title}</h3>
              {#if event.stats}
                <div class="flex items-center gap-3 text-xs text-stone-500">
                  <span><strong class="text-slate-700">{event.stats.entrants > 0 ? event.stats.entrants : 'Unknown'}</strong> entrants</span>
                  {#if event.stats.waitlist > 0}
                    <span><strong class="text-orange-600">{event.stats.waitlist}</strong> waitlist</span>
                  {/if}
                </div>
              {/if}
              <svg class="w-4 h-4 text-stone-400 group-hover:text-orange-500 transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          {/each}
        </div>
      {/if}

      <!-- Race Videos -->
      {#if enrichment.videos && enrichment.videos.length > 0}
        <div class="bg-white rounded-2xl p-8 border border-stone-200 shadow-lg">
          <h2 class="text-2xl font-black text-slate-800 mb-6 tracking-tight">Race Videos</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each enrichment.videos as video}
              <div class="group">
                <div class="aspect-video rounded-xl overflow-hidden bg-stone-100 mb-3">
                  {#if isYouTubeUrl(video.url)}
                    {@const videoId = extractYouTubeId(video.url)}
                    <iframe
                      src="https://www.youtube.com/embed/{videoId}"
                      title={video.title}
                      class="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  {:else}
                    <a href={video.url} target="_blank" rel="noopener noreferrer" aria-label="Watch {video.title}" class="flex items-center justify-center w-full h-full bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                      <svg class="w-16 h-16 opacity-80" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>
                    </a>
                  {/if}
                </div>
                <h3 class="font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-2">{video.title}</h3>
                {#if video.channelTitle}
                  <p class="text-xs text-stone-400 mt-0.5">by {video.channelTitle}</p>
                {/if}
                {#if video.reason}
                  <p class="text-sm text-stone-500 mt-1 line-clamp-2">{video.reason}</p>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Media Coverage -->
      {#if enrichment.media && enrichment.media.length > 0}
        <div class="bg-white rounded-2xl p-8 border border-stone-200 shadow-lg">
          <h2 class="text-2xl font-black text-slate-800 mb-6 tracking-tight">Media Coverage</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each enrichment.media as item}
              <a href={item.url} target="_blank" rel="noopener noreferrer" class="group flex gap-4 p-4 rounded-xl border border-stone-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                    {#if item.type === 'podcast'}
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" /></svg>
                    {:else if item.type === 'interview'}
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" /></svg>
                    {:else}
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd" /><path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" /></svg>
                    {/if}
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">{item.title}</h3>
                  {#if item.source}
                    <p class="text-xs text-stone-400 mt-0.5">{item.source}</p>
                  {/if}
                  {#if item.summary}
                    <p class="text-sm text-stone-500 mt-1 line-clamp-2">{item.summary}</p>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Course Intel from Videos -->
      {#if enrichment.videoInsights}
        <div class="bg-white rounded-2xl p-8 border border-stone-200 shadow-lg">
          <h2 class="text-2xl font-black text-slate-800 mb-6 tracking-tight">Race Insights</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#if enrichment.videoInsights.proTips && enrichment.videoInsights.proTips.length > 0}
              <div class="bg-green-50 rounded-xl p-6 border border-green-100">
                <h3 class="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                  Pro Tips
                </h3>
                <ul class="space-y-2">
                  {#each enrichment.videoInsights.proTips as tip}
                    <li class="text-green-700 text-sm flex items-start gap-2">
                      <span class="text-green-500 mt-1">•</span>
                      {tip}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
            
            {#if enrichment.videoInsights.challengingSections && enrichment.videoInsights.challengingSections.length > 0}
              <div class="bg-amber-50 rounded-xl p-6 border border-amber-100">
                <h3 class="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                  Challenging Sections
                </h3>
                <ul class="space-y-2">
                  {#each enrichment.videoInsights.challengingSections as section}
                    <li class="text-amber-700 text-sm flex items-start gap-2">
                      <span class="text-amber-500 mt-1">•</span>
                      {section}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
            
            {#if enrichment.videoInsights.courseHighlights && enrichment.videoInsights.courseHighlights.length > 0}
              <div class="bg-sky-50 rounded-xl p-6 border border-sky-100">
                <h3 class="font-bold text-sky-800 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  Course Highlights
                </h3>
                <ul class="space-y-2">
                  {#each enrichment.videoInsights.courseHighlights as highlight}
                    <li class="text-sky-700 text-sm flex items-start gap-2">
                      <span class="text-sky-500 mt-1">•</span>
                      {highlight}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
            
            {#if enrichment.videoInsights.dnfRisks && enrichment.videoInsights.dnfRisks.length > 0}
              <div class="bg-red-50 rounded-xl p-6 border border-red-100">
                <h3 class="font-bold text-red-800 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                  DNF Risks
                </h3>
                <ul class="space-y-2">
                  {#each enrichment.videoInsights.dnfRisks as risk}
                    <li class="text-red-700 text-sm flex items-start gap-2">
                      <span class="text-red-500 mt-1">•</span>
                      {risk}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/if}


  </div>
</div>

