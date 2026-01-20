<script lang="ts">
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Separator from "$lib/components/Separator.svelte";
  import TagButton from "$lib/components/TagButton.svelte";
  import type { Post } from "$lib/content/posts";

  interface Props {
    post: Post;
    showTags?: boolean;
    showDescription?: boolean;
    enableTransitions?: boolean;
  }

  let {
    post,
    showTags = true,
    showDescription = false,
    enableTransitions = false,
  }: Props = $props();
</script>

<li class="flex items-baseline gap-2 py-1">
  <div class="min-w-0 flex-1">
    <a
      href={post.relativeURL}
      class="hover:underline"
      style:view-transition-name={enableTransitions
        ? `post-title-${post.id}`
        : undefined}
    >
      {post.title}
    </a>
    {#if showDescription && post.description}
      <p class="text-sm text-muted-foreground">{post.description}</p>
    {/if}
    <div class="text-xs mt-0.5 flex items-center gap-2 flex-wrap">
      <FormattedDate date={post.pubDate} />
      {#if post.tags && post.tags.length > 0 && showTags}
        <Separator />
        <div class="flex gap-1 flex-wrap">
          {#each post.tags as tag}
            <TagButton {tag} />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</li>