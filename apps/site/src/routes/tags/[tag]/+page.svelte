<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import PostList from '$lib/components/PostList.svelte';
	import { DEFAULT_DESCRIPTION } from '$lib/constants';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Head
	title="#{data.tag}"
	description={DEFAULT_DESCRIPTION}
	pathname="/blog/tag/{data.tag}"
	imagePath="/avatar.jpeg"
/>

<main class="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
	<h1 class="text-4xl mb-6">#{data.tag}</h1>
	<PostList posts={data.posts} showDescription={true} />
</main>
