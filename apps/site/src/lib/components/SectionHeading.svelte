<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    title?: string;
    class?: string;
    children?: import("svelte").Snippet;
    [key: string]: any;
  }

  let { title, class: className, children, ...rest }: Props = $props();
</script>

<h2
  class={cn(
    "text-xl font-bold uppercase border-b-2 border-foreground pb-1 tracking-wider",
    className
  )}
  {...rest}
>
  {#if children}
    {@render children()}
  {:else if title}
    {title}
  {/if}
</h2>
