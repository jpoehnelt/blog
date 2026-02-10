<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let { class: className, children, ...rest }: Props = $props();
</script>

<h2
  class={cn(
    "text-xl font-bold uppercase border-b-2 border-foreground pb-1 tracking-wider",
    className
  )}
  {...rest}
>
  {@render children?.()}
</h2>
