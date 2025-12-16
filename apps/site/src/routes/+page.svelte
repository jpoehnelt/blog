<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Image from "$lib/components/content/Image.svelte";
  import ActivityList from "$lib/components/ActivityList.svelte";
  import PostTagCloud from "$lib/components/PostTagCloud.svelte";
  import {
    DEFAULT_TITLE,
    BASE_URL,
    AUTHOR_NAME,
    DEFAULT_DESCRIPTION,
  } from "$lib/constants";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const recentPosts = data.posts;
  const recentActivities = data.activities.slice(0, 10);
  const recentRaces = data.races;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    address: {
      "@type": "PostalAddress",
      addressRegion: "CO",
    },
    jobTitle: "Software Engineer",
    name: AUTHOR_NAME,
    url: BASE_URL,
  };
</script>

<Head
  title={DEFAULT_TITLE}
  description={DEFAULT_DESCRIPTION}
  pathname="/"
  {jsonLd}
/>

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 flex flex-col items-center space-y-8">
      <!-- Profile Image -->
      <Image
        src="src/images/justin-poehnelt.jpg"
        alt="At the finish of the San Juan Softie 100 mile ultramarathon"
        class="rounded-full max-w-full sm:max-w-sm mx-auto"
      />

      <!-- Welcome Section -->
      <section class=" space-y-4">
        <h1 id="about" class="text-4xl font-bold">About</h1>
        <p class="text-base leading-relaxed max-w-2xl">
          I'm a Developer Relations Engineer at Google, focusing on Google
          Workspace. My work involves creating tools and supporting the
          open-source community. Before Google, I had the opportunity to work with
          geospatial data at Descartes Labs and the US Geological Survey. When I'm
          not coding, I'm usually running long distances in the mountains of
          Colorado, and I enjoy writing about my experiences in both tech and
          ultrarunning.
        </p>
      </section>

      <!-- Tags Section -->
      <section class="w-full max-w-2xl space-y-4">
        <h2 id="tags" class="text-2xl font-bold">Tags</h2>
        <PostTagCloud tags={data.tags} />
      </section>

      <!-- Recent Posts Section -->
      <section class="w-full max-w-2xl space-y-4">
        <h2 id="recent-posts" class="text-2xl font-bold">Recent posts</h2>
        <ul class="space-y-2">
          {#each recentPosts as post (post.id)}
            <li>
              <FormattedDate date={post.pubDate} /> -
              <a href={post.relativeURL} class="hover:underline">{post.title}</a>
            </li>
          {/each}
        </ul>
      </section>
    </div>

    <div class="space-y-8">
      <!-- Races Section -->
      {#if recentRaces.length > 0}
        <section class="w-full max-w-2xl space-y-4">
          <h2 id="races" class="text-2xl font-bold">Races</h2>
          <ActivityList activities={recentRaces} />
        </section>
      {/if}

      <!-- Recent Activities Section -->
      <section class="w-full max-w-2xl space-y-4">
        <h2 id="recent-activities" class="text-2xl font-bold">Recent activities</h2>
        <ActivityList activities={recentActivities} />
      </section>
    </div>
  </div>
</main>
