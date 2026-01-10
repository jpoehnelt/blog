<script lang="ts">
  import { badgeVariants } from "$lib/components/ui/badge/index.js";
  import { cn } from "$lib/utils.js";

  interface Props {
    tag: string;
    count?: number;
    class?: string;
    [key: string]: any;
  }

  let { tag, count, class: className, ...rest }: Props = $props();

  let label = $derived(`Tag: ${tag}${count !== undefined ? `, ${count} posts` : ''}`);
</script>

<a
  href="/tags/{encodeURIComponent(tag)}"
  class={cn(badgeVariants({ variant: "secondary" }), "not-prose no-underline hover:no-underline", className)}
  aria-label={label}
  {...rest}
>
  #{tag}
  {#if count !== undefined}
    <span class="ml-1 text-muted-foreground">({count})</span>
  {/if}
</a>
