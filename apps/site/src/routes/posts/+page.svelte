<script lang="ts">
  import Head from "$lib/components/Head.svelte";
  import PostList from "$lib/components/PostList.svelte";
  import { page } from "$app/state";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Head
  title={"Archive"}
  description={"Blog post archive for Justin Poehnelt"}
  pathname={"/posts"}
/>

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
  <PostList posts={data.posts.reverse()} />
</main>
