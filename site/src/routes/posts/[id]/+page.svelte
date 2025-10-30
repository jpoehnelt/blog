<script lang="ts">
  import CoffeeIcon from "@lucide/svelte/icons/coffee";
  import LinkIcon from "@lucide/svelte/icons/link";
  import LinkedinIcon from "@lucide/svelte/icons/linkedin";
  import ShareIcon from "@lucide/svelte/icons/share";
  import { siBluesky, siReddit, siX, siYcombinator } from "simple-icons";

  import { resolve } from "$app/paths";

  import BrandIcon from "$lib/components/BrandIcon.svelte";
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Head from "$lib/components/Head.svelte";
  import PostCard from "$lib/components/PostCard.svelte";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
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

<main data-pagefind-body>
  <article class="prose mx-auto p-2">
    <div class="flex flex-col gap-2">
      <h1 class="mb-0">{data.title}</h1>
      <span class="text-xs">
        Published on <b><FormattedDate date={data.pubDate} /></b>
      </span>
      {#if data.lastMod}
        <span>
          Updated on <b><FormattedDate date={data.lastMod} /></b>
        </span>
      {/if}
      
    </div>

    {@html data.contentHTML}

  </article>
  <section data-pagefind-ignore class="mb-4 flex w-full justify-center p-2">
    <div class="flex w-full max-w-[54rem] flex-col items-center gap-2">
      <div class="divider">Related Articles</div>
      <div class="flex w-full flex-wrap justify-center gap-4">
        {#each data.recommendations as rec (rec.id)}
          <PostCard post={rec} />
        {/each}
      </div>
    </div>
  </section>
</main>
