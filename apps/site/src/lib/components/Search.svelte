<script lang="ts">
  import algoliasearch from "algoliasearch/lite";
  import { browser } from "$app/environment";

  const searchClient = algoliasearch(
    "S9JK6686GJ",
    "c0cecf984cdee236bab37e90807b4348"
  );
  const index = searchClient.initIndex("posts");

  let query = $state("");
  let hits = $state<any[]>([]);
  let showResults = $state(false);

  // Debounce could be added, but for now direct call on input is fine for small scale
  async function handleSearch() {
    if (!query.trim()) {
      hits = [];
      showResults = false;
      return;
    }

    // Only search in browser
    if (!browser) return;

    try {
      const { hits: searchHits } = await index.search(query);
      hits = searchHits;
      showResults = true;
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  function handleBlur() {
    // Delay hiding to allow click on link
    setTimeout(() => {
      showResults = false;
    }, 200);
  }

  function handleFocus() {
    if (query.trim()) {
      showResults = true;
    }
  }
</script>

<div class="search-container relative w-full">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
  <input
    type="search"
    class="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-9"
    placeholder="Search..."
    bind:value={query}
    oninput={handleSearch}
    onfocus={handleFocus}
    onblur={handleBlur}
  />

  {#if showResults && hits.length > 0}
    <div
      class="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none overflow-hidden max-h-96 overflow-y-auto"
    >
      <ul class="list-none p-0 m-0">
        {#each hits as hit (hit.objectID)}
          <li
            class="border-b last:border-0 hover:bg-muted/50 transition-colors"
          >
            <a href="/posts/{hit.slug}" class="block px-4 py-2 text-sm">
              <div class="font-medium">{hit.title}</div>
              {#if hit.description}
                <div class="text-xs text-muted-foreground line-clamp-1">
                  {hit.description}
                </div>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
      <div
        class="p-2 text-xs text-center text-muted-foreground border-t bg-muted/20"
      >
        Powered by Algolia
      </div>
    </div>
  {/if}
</div>
