<script lang="ts">
  import Snippet from "$lib/components/content/Snippet.svelte";
  import snippets from "$lib/data/snippets.json";
</script>

<div class="container py-8 max-w-4xl mx-auto space-y-8">
  <div class="space-y-2">
    <h1 class="text-3xl font-bold">Snippets Registry</h1>
    <p class="text-muted-foreground">
      A complete index of all {snippets.length} code snippets
      used across the blog.
    </p>
  </div>

  <div class="space-y-6 prose max-w-none">
    {#each snippets as snippet}
      <div class="flex flex-col">
        <div
          class="flex items-center justify-between px-1 mb-1"
        >
          <a
            href="/posts/{snippet.postSlug}"
            class="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            In: {snippet.postTitle}
          </a>
          {#if !snippet.description}
            <span
              class="text-xs text-yellow-500 font-medium"
              >⚠️ Missing description</span
            >
          {/if}
        </div>

        <Snippet
          src={snippet.src}
          description={snippet.description}
          githubUrl={snippet.githubUrl}
          code={snippet.code}
          rawContent={snippet.rawContent}
        />
      </div>
    {/each}
  </div>
</div>
