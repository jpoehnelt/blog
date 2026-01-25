<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  // @ts-ignore - TS fails to match the complex query string to the *&enhanced ambient module declaration
  import justinPoehneltImg from "$lib/images/justin-poehnelt.jpg?w=1326;800;400&enhanced";
  import ActivityList from "$lib/components/ActivityList.svelte";
  import PostTagCloud from "$lib/components/PostTagCloud.svelte";
  import RunningChart from "$lib/components/RunningChart.svelte";
  import ActivityListItem from "$lib/components/ActivityListItem.svelte";
  import PostCard from "$lib/components/PostCard.svelte";
  import {
    DEFAULT_TITLE,
    BASE_URL,
    AUTHOR_NAME,
    DEFAULT_DESCRIPTION,
  } from "$lib/constants";

  import type { PageProps } from "./$types";

  import JsonLd from "$lib/components/JsonLd.svelte";
  import type { Thing, WithContext } from "schema-dts";

  let { data }: PageProps = $props();

  const recentPosts = data.posts;
  const recentActivities = data.recentActivities;
  const recentRaces = data.recentRaces;
  const runningChartData = data.runningChartData;
  const featuredPost = recentPosts[0];
  const otherPosts = recentPosts.slice(1);

  const schema: WithContext<Thing>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: DEFAULT_TITLE,
      url: BASE_URL,
      author: {
        "@type": "Person",
        name: AUTHOR_NAME,
      },
      description: DEFAULT_DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: AUTHOR_NAME,
      url: BASE_URL,
      jobTitle: "Software Engineer",
      sameAs: [
        "https://github.com/jpoehnelt",
        "https://www.linkedin.com/in/justin-poehnelt",
        "https://www.strava.com/athletes/2170160",
      ],
    },
  ];
</script>

<Head title={DEFAULT_TITLE} description={DEFAULT_DESCRIPTION} pathname="/" />
<JsonLd {schema} />

<main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-foreground">
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <!-- Column 1: Editor's Note (Sidebar) -->
    <div
      class="lg:col-span-1 border-r-0 lg:border-r border-border pr-0 lg:pr-8"
    >
      <div class="sticky top-8 space-y-8">
        <section class="space-y-4">
          <h2
            class="text-xl font-bold uppercase border-b-2 border-foreground pb-1 mb-4"
            id="about"
          >
            About
          </h2>
          <enhanced:img
            src={justinPoehneltImg}
            alt="Justin Poehnelt"
            class="w-full grayscale contrast-125 filter rounded-sm mx-auto"
            loading="eager"
            fetchpriority="high"
            sizes="(min-width: 1024px) 300px, 100vw"
          />
          <div class="prose prose-sm">
            <p>
              I'm a Developer Relations Engineer at Google, focusing on Google
              Workspace. My work involves creating tools and supporting the
              open-source community.
            </p>
            <p>
              Before Google, I had the opportunity to work with geospatial data
              at Descartes Labs and the US Geological Survey.
            </p>
            <p>
              When I'm not coding, I'm usually running long distances in the
              mountains of Colorado.
            </p>
          </div>
        </section>

        <section class="space-y-2">
          <h3
            class="text-lg font-bold uppercase border-b border-muted-foreground/50 pb-1"
          >
            Topics
          </h3>
          <PostTagCloud tags={data.tags.slice(0, 10)} />
        </section>
      </div>
    </div>

    <!-- Column 2 & 3: Main Stories (Headlines) -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Featured Story -->
      <section class="border-b border-border pb-8">
        <div
          class="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"
        >
          Lead Story
        </div>
        <h1
          class="text-4xl md:text-5xl font-black leading-tight mb-4 hover:underline decoration-4 underline-offset-4"
        >
          <a
            href={featuredPost.relativeURL}
            style:view-transition-name="post-title-{featuredPost.id}"
            >{featuredPost.title}</a
          >
        </h1>
        <div
          class="flex flex-wrap md:flex-nowrap items-center gap-x-4 mb-4 text-sm font-mono text-muted-foreground border-y border-border py-1"
        >
          <div class="whitespace-nowrap shrink-0">
            <FormattedDate date={featuredPost.pubDate} />
          </div>
          {#if featuredPost.tags}
            <span class="hidden md:inline text-border">|</span>
            <span class="line-clamp-1 min-w-0 shrink"
              >{featuredPost.tags.join(", ")}</span
            >
          {/if}
        </div>
        <p class="text-lg md:text-xl leading-relaxed line-clamp-4">
          {featuredPost.description ||
            "Read the latest update from the blog..."}
        </p>
      </section>

      <!-- Sub Headlines (Grid) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        {#each otherPosts.slice(0, 20) as post}
          <PostCard {post} />
        {/each}
      </div>
    </div>

    <!-- Column 4: Sports & Reports -->
    <div
      class="lg:col-span-1 border-l-0 lg:border-l border-border pl-0 lg:pl-8 space-y-8"
    >
      <!--  Chart -->
      <section>
        <RunningChart data={runningChartData} />
      </section>

      <!-- Races -->
      <section>
        <h2
          class="text-xl font-bold uppercase border-b-2 border-foreground pb-1 mb-4"
          id="races"
        >
          Race Results
        </h2>
        {#if recentRaces.length > 0}
          <ul class="space-y-4 list-none p-0 m-0">
            {#each recentRaces as race}
              <ActivityListItem activity={race} />
            {/each}
          </ul>
        {:else}
          <p class="text-sm text-muted-foreground italic">No recent races.</p>
        {/if}
      </section>

      <!-- Activities-->
      <section>
        <h2
          class="text-xl font-bold uppercase border-b-2 border-foreground pb-1 mb-4"
          id="activities"
        >
          Activities
        </h2>
        <div class="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          <ActivityList activities={recentActivities.slice(0, 5)} />
        </div>
      </section>
    </div>
  </div>
</main>
