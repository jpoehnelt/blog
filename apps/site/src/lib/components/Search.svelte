<script lang="ts">
  import algoliasearch from "algoliasearch/lite";
  import { browser } from "$app/environment";
  import SearchIcon from "@lucide/svelte/icons/search";
  import * as Command from "$lib/components/ui/command";
  import { cn } from "$lib/utils.js";

  const searchClient = algoliasearch(
    "S9JK6686GJ",
    "c0cecf984cdee236bab37e90807b4348"
  );
  const index = searchClient.initIndex("posts");

  let query = $state("");
  let hits = $state<any[]>([]);
  let open = $state(false);

  // Handle Cmd+K
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open = !open;
    }
  }

  $effect(() => {
    if (browser) {
      document.addEventListener("keydown", handleKeydown);
      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  });

  async function handleSearch(value: string) {
    // If value is empty, clear hits
    if (!value.trim()) {
      hits = [];
      return;
    }

    if (!browser) return;

    try {
      const { hits: searchHits } = await index.search(value);
      hits = searchHits;
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  // Reactively trigger search when query changes
  $effect(() => {
     handleSearch(query);
  });
</script>

<button
  onclick={() => (open = true)}
  class={cn(
    "relative w-full justify-start rounded-md border border-input bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 flex items-center gap-2"
  )}
>
  <SearchIcon class="h-4 w-4 shrink-0 opacity-50" />
  <span class="hidden lg:inline-flex">Search posts...</span>
  <span class="inline-flex lg:hidden">Search...</span>
  <kbd
    class="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex"
  >
    <span class="text-xs">⌘</span>K
  </kbd>
</button>

<Command.Dialog bind:open shouldFilter={false} title="Search Posts">
  <Command.Input bind:value={query} placeholder="Type to search..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    {#if hits.length > 0}
        <Command.Group heading="Posts">
            {#each hits as hit (hit.objectID)}
                <Command.LinkItem
                    href="/posts/{hit.slug}"
                    onclick={() => open = false}
                    class="flex flex-col items-start gap-1"
                >
                    <span class="font-medium leading-none">{hit.title}</span>
                    {#if hit.description}
                        <span class="text-xs text-muted-foreground line-clamp-1">{hit.description}</span>
                    {/if}
                </Command.LinkItem>
            {/each}
        </Command.Group>
    {/if}
  </Command.List>
</Command.Dialog>
