<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import ActivityList from "$lib/components/ActivityList.svelte";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Head
  title={"Activities"}
  description={"Outdoor activities  such as running, biking, and hiking for Justin Poehnelt"}
  pathname={"/activities"}
/>

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
  <ActivityList activities={data.activities} />
</main>
