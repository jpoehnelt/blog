<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Image from "$lib/components/content/Image.svelte";
  import {
    DEFAULT_TITLE,
    BASE_URL,
    AUTHOR_NAME,
    AUTHOR_EMAIL,
    DEFAULT_DESCRIPTION,
  } from "$lib/constants";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const recentPosts = data.posts.slice(0, 10);

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
  <div class="flex flex-col items-center space-y-8">
    <!-- Profile Image -->
    <Image
      src="src/images/justin-poehnelt.jpg"
      alt="At the finish of the San Juan Softie 100 mile ultramarathon"
      class="rounded-full max-w-full sm:max-w-sm mx-auto"
    />

    <!-- Welcome Section -->
    <section class=" space-y-4">
      <h1 class="text-4xl font-bold">About</h1>
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

    <!-- Socials Section -->
    <section class="w-full max-w-2xl space-y-4">
      <h2 class="text-2xl font-bold">Socials</h2>
      <p>You can follow me on these other sites.</p>
      <ul class="list-disc list-inside space-y-2">
        <li>
          <a
            rel="noopener noreferrer me"
            href="https://github.com/jpoehnelt"
            class="hover:underline">GitHub</a
          >
        </li>
        <li>
          <a
            rel="noopener noreferrer me"
            href="https://www.linkedin.com/in/justin-poehnelt"
            class="hover:underline">LinkedIn</a
          >
        </li>
        <li>
          <a
            rel="noopener noreferrer me"
            href="https://dev.to/jpoehnelt"
            class="hover:underline">Dev.to</a
          >
        </li>
      </ul>
    </section>

    <!-- Recent Posts Section -->
    <section class="w-full max-w-2xl space-y-4">
      <h2 class="text-2xl font-bold">Recent posts</h2>
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
</main>
