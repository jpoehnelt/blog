<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let { class: className, children, ...rest }: Props = $props();
</script>

<span
  class={cn("text-muted-foreground/50", className)}
  aria-hidden="true"
  {...rest}
>
  {#if children}
    {@render children()}
  {:else}
    •
  {/if}
</span>
