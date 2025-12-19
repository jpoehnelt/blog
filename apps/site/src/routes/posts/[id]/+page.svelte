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

{#snippet toc(items: typeof data.toc)}
  {#if items && items.length > 1}
    <div class="mb-8 lg:mb-0">
      <h3 class="font-bold mb-4 uppercase text-xs text-gray-500">
        On this page
      </h3>
      <ul class="space-y-2 text-sm list-none pl-2 border-l border-gray-200 dark:border-gray-700">
        {#each items as item}
          <li>
            <a
              href="#{item.id}"
              class="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 -ml-[1px]"
              class:pl-4={item.depth === 3}
            >
              {item.text}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
{/snippet}

<main
  class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 lg:gap-12 justify-center"
>
  <div class="lg:hidden">
    {@render toc(data.toc)}
  </div>

  <article class="prose flex-1 min-w-0 ">
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

  <aside class="mt-8 lg:mt-0 prose w-full lg:w-72 shrink-0">
    <div class="hidden lg:block mb-8">
       {@render toc(data.toc)}
    </div>

    <h3>Related Articles</h3>
    <PostList posts={data.recommendations} showTags={false} />
    <h3>Latest Articles</h3>
    <PostList posts={data.latest} showTags={false} />
  </aside>
</main>
