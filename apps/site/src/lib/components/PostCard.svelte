<script lang="ts">
  import DateDisplay from "$lib/components/DateDisplay.svelte";
  import type { Post } from "$lib/content/posts";
  import { cn } from "$lib/utils";

  interface Props {
    post: Post;
    class?: string;
    [key: string]: any;
  }

  let { post, class: className, ...rest }: Props = $props();
</script>

<article class={cn("flex flex-col h-full", className)} {...rest}>
  <h4 class="text-xl font-bold mb-2 leading-snug hover:underline">
    <a
      href={post.relativeURL}
      style:view-transition-name="post-title-{post.id}"
    >
      {post.title}
    </a>
  </h4>
  <div class="text-xs text-muted-foreground mb-2">
    <DateDisplay date={post.pubDate} />
  </div>
  <p class="text-sm line-clamp-3 text-muted-foreground flex-grow">
    {post.description}
  </p>
</article>
