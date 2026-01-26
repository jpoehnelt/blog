<script>
  export let data;
  
  // Reactive so it updates on year change
  $: ({ races, years, selectedYear } = data);
  
  $: title = `${selectedYear} Ultra Race Waitlists and Stats`;
  $: description = `Track waitlist movement and statistics for popular ultramarathons like Cocodona 250 in ${selectedYear}.`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={`https://justin.poehnelt.com/ultras/races/${selectedYear}`} />
</svelte:head>

<div class="prose dark:prose-invert mx-auto max-w-3xl py-12 px-6">
  <h1>{selectedYear} Ultra Marathon Races</h1>
  
  <p>
    Tracking entrants and waitlist movement for popular ultramarathons. 
    Select a year to see available race data.
  </p>

  {#if years.length > 0}
  <div class="flex flex-wrap gap-2 mb-8">
    {#each years as year}
      <a 
        href="/ultras/races/{year}" 
        class="px-4 py-2 rounded-full text-sm font-medium transition-colors 
        {year === selectedYear 
          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
      >
        {year}
      </a>
    {/each}
  </div>
  {/if}

  {#if races.length > 0}
    <div class="grid gap-6">
      {#each races as race}
        <a 
          href="/ultras/races/{race.year}/{race.slug}"
          class="block p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow no-underline"
        >
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-semibold mt-0 mb-2">{race.name}</h2>
              <div class="text-sm text-muted-foreground">
                {#if race.date}
                  {new Date(race.date).toLocaleDateString()}
                {:else}
                  {race.year}
                {/if}
              </div>
            </div>
            <span class="text-primary font-medium text-sm">View &rarr;</span>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <div class="p-8 text-center border rounded-lg bg-muted/20">
      <p class="text-muted-foreground mb-0">No races found for {selectedYear}.</p>
    </div>
  {/if}
  
    <div class="mt-12 pt-8 border-t text-sm text-muted-foreground">
    <p>
        These stats are tracked automatically. If you'd like to add a race, 
        <a href="https://github.com/jpoehnelt/blog-2" target="_blank" rel="noreferrer">submit a PR</a> or 
        <a href="mailto:justin@poehnelt.com">contact me</a>.
    </p>
  </div>
</div>
