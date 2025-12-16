<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import PostTagCloud from '$lib/components/PostTagCloud.svelte';
  import { DEFAULT_DESCRIPTION } from '$lib/constants';

  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<Head
  title="Tags"
  description={DEFAULT_DESCRIPTION}
  pathname="/tags"
  imagePath="/avatar.jpeg"
/>

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
  <h1 class="text-4xl mb-6">Tags</h1>
  <PostTagCloud tags={data.tags} />
</main>
