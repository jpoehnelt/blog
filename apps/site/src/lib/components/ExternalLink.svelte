<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    href: string;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let { href, class: className, children, ...rest }: Props = $props();
</script>

<a
  {href}
  target="_blank"
  rel="noopener noreferrer"
  class={cn(className)}
  {...rest}
>
  {@render children?.()}
</a>
