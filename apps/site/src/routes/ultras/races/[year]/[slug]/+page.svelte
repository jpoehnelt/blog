<script>
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  let { data } = $props();
  let race = $derived(data.race);
</script>

<svelte:head>
  <title>{race.year} {race.name} - Event Selection</title>
</svelte:head>

<div class="min-h-screen bg-stone-50 pb-20">
  <!-- Hero Section -->
  <div class="relative bg-slate-900 text-stone-100 overflow-hidden shadow-2xl">
    <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
    
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
               <Breadcrumb.Page class="text-white font-medium">{race.name}</Breadcrumb.Page>
            </Breadcrumb.Item>
         </Breadcrumb.List>
      </Breadcrumb.Root>

      <div class="max-w-4xl">
        <div class="flex items-center gap-3 mb-4">
          <span class="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-semibold tracking-wide border border-orange-600/30">EVENT SELECTION</span>
           <span class="text-stone-400 text-sm font-medium tracking-wide uppercase">{race.date ? new Date(race.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : race.year}</span>
        </div>
        <h1 class="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
          {race.name}
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
    <div>
        <h2 class="text-2xl font-black text-slate-800 mb-6 tracking-tight">Select an Event</h2>
        
        {#if race.events && race.events.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each race.events as event}
                    <a href="/ultras/races/{race.year}/{race.slug}/{event.id}" class="group block bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div class="p-8">
                            <h3 class="text-2xl font-black text-slate-800 mb-6 group-hover:text-orange-600 transition-colors">{event.title}</h3>
                            
                            <div class="flex gap-4 text-sm mb-6">
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
