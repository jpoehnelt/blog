<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Head from "$lib/components/Head.svelte";
  import PostList from "$lib/components/PostList.svelte";
  import TagButton from "$lib/components/TagButton.svelte";
  import { AUTHOR_NAME, LICENSE } from "$lib/constants";
  import { siMarkdown } from "simple-icons";
  import BrandIcon from "$lib/components/BrandIcon.svelte";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
  // Use $derived to ensure PostContent updates when data changes (e.g. navigation)
  let PostContent = $derived(data.PostContent);
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

<main
  class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-12 [&>article]:flex-1 [&>aside]:max-w-[300px] justify-center"
>
  <article class="prose">
    <div class="flex flex-col gap-2">
      <h1 class="mb-0">{data.title}</h1>
      <div class="flex flex-wrap gap-1 items-center">
        <span class="text-xs">
          Published on <b><FormattedDate date={data.pubDate} /></b>
        </span>
        {#if data.lastMod}
          <span class="text-xs">
            Updated on <b><FormattedDate date={data.lastMod} /></b>
          </span>
        {/if}
        <a
          href={data.markdownURL}
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          title="View Markdown"
          aria-label="View Markdown"
          target="_blank"
        >
          <BrandIcon icon={siMarkdown} size={20} class="text-gray-500" />
        </a>
      </div>

      {#if data.tags && data.tags.length > 0}
        <div class="flex flex-wrap gap-2 mt-2">
          {#each data.tags as tag (tag)}
            <TagButton {tag} />
          {/each}
        </div>
      {/if}
    </div>

    <PostContent />
    <div class="mt-8">
      <p class="text-xs">
        © {data.pubDate.getFullYear()} by {AUTHOR_NAME} is licensed under {LICENSE}
      </p>
    </div>
  </article>
  <aside class="mt-8 lg:mt-0 prose">
    <h3>Related Articles</h3>
    <PostList posts={data.recommendations} showTags={false} />
    <h3>Latest Articles</h3>
    <PostList posts={data.latest} showTags={false} />
  </aside>
</main>
