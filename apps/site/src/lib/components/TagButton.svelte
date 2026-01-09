<script lang="ts">
  import { badgeVariants } from "$lib/components/ui/badge/index.js";
  import { cn } from "$lib/utils.js";

  interface Props {
    tag: string;
    count?: number;
    [key: string]: any;
  }

  let { tag, count, class: className, ...rest }: Props = $props();
</script>

<a
  href="/tags/{encodeURIComponent(tag)}"
  class={cn(
    badgeVariants({ variant: "secondary" }),
    "no-underline rounded-full px-3 py-1 text-xs gap-2 hover:bg-secondary/80 transition-colors",
    className
  )}
  {...rest}
>
  <span>#{tag}</span>
  {#if count !== undefined}
    <span class="text-xs text-muted-foreground opacity-70">({count})</span>
  {/if}
</a>
