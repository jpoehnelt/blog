<script>
  import algoliasearch from "algoliasearch/lite";
  import {
    InstantSearch,
    SearchBox,
    Hits,
  } from "svelte-algolia-instantsearch";

  const searchClient = algoliasearch(
    "OPS7PRN11P",
    "3f53b3eee774f81113afbbc833a38771"
  );
</script>

<div class="search-container">
  <InstantSearch {searchClient} indexName="posts">
    <div class="relative w-64">
      <SearchBox
        class="w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Search..."
      />
      <div class="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none empty:hidden">
        <Hits />
      </div>
    </div>
  </InstantSearch>
</div>

<style>
  /* Basic styling overrides if needed, assuming usage of Tailwind in the parent context */
  :global(.ais-SearchBox-form) {
    display: flex;
    align-items: center;
  }
  :global(.ais-SearchBox-input) {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
  }
  :global(.ais-SearchBox-submit), :global(.ais-SearchBox-reset) {
    display: none;
  }
  :global(.ais-Hits-list) {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  :global(.ais-Hits-item) {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid hsl(var(--border));
  }
  :global(.ais-Hits-item:last-child) {
    border-bottom: none;
  }
</style>
