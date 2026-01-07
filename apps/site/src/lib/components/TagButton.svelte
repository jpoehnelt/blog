<script lang="ts">
  import { badgeVariants } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils";

  interface Props {
    tag: string;
    count?: number;
    [key: string]: any;
  }

  let { tag, count, ...rest }: Props = $props();
</script>

<a
  href="/tags/{encodeURIComponent(tag)}"
  class={cn(
    badgeVariants({ variant: "secondary" }),
    "not-prose gap-2 px-3 py-1 font-normal text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700 no-underline"
  )}
  {...rest}
>
  <span>#{tag}</span>
  {#if count !== undefined}
    <span class="text-xs text-muted-foreground">({count})</span>
  {/if}
</a>
