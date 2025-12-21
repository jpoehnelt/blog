<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import TagButton from "$lib/components/TagButton.svelte";
  import type { Post } from "$lib/content/posts";

  interface Props {
    post: Post;
    showTags?: boolean;
  }

  let { post, showTags = true }: Props = $props();
</script>

<div class="flex items-baseline gap-2 py-1">
  <div class="min-w-0 flex-1">
    <a
      href={post.relativeURL}
      class="hover:underline"
    >
      {post.title}
    </a>
    {#if post.description}
      <p class="text-sm text-muted-foreground">{post.description}</p>
    {/if}
    <div class="text-xs mt-0.5 flex items-center gap-2 flex-wrap">
      <FormattedDate date={post.pubDate} />
      {#if post.tags && post.tags.length > 0 && showTags}
        <span class="text-muted-foreground/50">•</span>
        <div class="flex gap-1 flex-wrap">
          {#each post.tags as tag}
              <TagButton {tag} />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>