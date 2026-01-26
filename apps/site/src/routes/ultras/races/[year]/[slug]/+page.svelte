<script>
  export let data;
  const { race } = data;
</script>

<svelte:head>
  <title>{race.year} {race.name} - Event Selection</title>
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
          <svg class="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
          </svg>
          <a href="/ultras/races/{race.year}" class="hover:text-gray-900">{race.year} Waitlists</a>
        </div>
      </li>
      <li aria-current="page">
        <div class="flex items-center">
          <svg class="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
          </svg>
          <span class="text-gray-900">{race.name}</span>
        </div>
      </li>
    </ol>
  </nav>

  <h1 class="text-3xl font-bold mb-2">{race.year} {race.name}</h1>
  <div class="text-xl text-gray-600 mb-8">{race.location}</div>

  <h2 class="text-2xl font-semibold mb-4">Select an Event</h2>
  
  {#if race.events && race.events.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each race.events as event}
              <a href="/ultras/races/{race.year}/{race.slug}/{event.id}" class="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
                  <h3 class="text-xl font-bold mb-2">{event.title}</h3>
                  
                  <div class="flex gap-4 text-sm text-gray-600 mb-4">
                      {#if event.stats}
                          <div class="flex flex-col">
                              <span class="font-bold text-lg text-gray-900">{event.stats.waitlist}</span>
                              <span class="text-xs uppercase tracking-wide">Waitlist</span>
                          </div>
                          <div class="flex flex-col">
                              <span class="font-bold text-lg text-gray-900">{event.stats.entrants}</span>
                              <span class="text-xs uppercase tracking-wide">Entrants</span>
                          </div>
                      {/if}
                  </div>

                  <div class="text-blue-600 font-medium flex items-center">
                      View Stats & Entrants
                      <svg class="w-4 h-4 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                      </svg>
                  </div>
              </a>
          {/each}
      </div>
  {:else}
      <div class="p-6 bg-gray-100 rounded-lg text-gray-600">
          No events found for this race.
      </div>
  {/if}

</div>
