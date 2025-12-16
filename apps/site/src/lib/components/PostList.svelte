<script lang="ts">
  import PostListItem from "$lib/components/PostListItem.svelte";
  import type { Post } from "$lib/content/posts";

  interface Props {
    posts: Post[];
  }

  let { posts }: Props = $props();
</script>

<div class="space-y-1 max-w-4xl">
  {#each posts as post}
    <PostListItem {post} />
  {/each}
</div>