<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Head from "$lib/components/Head.svelte";
  import PostList from "$lib/components/PostList.svelte";
  import TagButton from "$lib/components/TagButton.svelte";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  const { PostContent } = data;
</script>

<Head
  title={data.title}
  description={data.description}
  pathname={data.relativeURL}
/>
<svelte:head>
  <meta
    property="article:published_time"
    content={data.pubDate.toISOString()}
  />
  <meta
    name="last-modified"
    content={(data.lastMod || data.pubDate).toISOString()}
  />
  <meta
    property="article:modified_time"
    content={(data.lastMod || data.pubDate).toISOString()}
  />
</svelte:head>

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
  <article class="prose prose-lg max-w-none">
    <div class="flex flex-col gap-2">
      <h1 class="mb-0">{data.title}</h1>
      <span class="text-xs">
        Published on <b><FormattedDate date={data.pubDate} /></b>
      </span>
      {#if data.lastMod}
        <span class="text-xs">
          Updated on <b><FormattedDate date={data.lastMod} /></b>
        </span>
      {/if}

      {#if data.tags && data.tags.length > 0}
        <div class="flex flex-wrap gap-2 mt-2">
          {#each data.tags as tag (tag)}
            <TagButton {tag} />
          {/each}
        </div>
      {/if}
    </div>

    <PostContent />
  </article>
  <section class="mt-8">
    <h2 class="text-2xl font-bold mb-4">Related Articles</h2>
    <PostList posts={data.recommendations} />
  </section>
</main>
