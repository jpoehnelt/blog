<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    open?: boolean;
    class?: string;
    [key: string]: any;
  }

  let { open = false, class: className, ...rest }: Props = $props();
</script>

<svg
  class={cn("size-6 pointer-events-none", className)}
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  aria-hidden="true"
  {...rest}
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    d="M4 6h16M4 12h16M4 18h16"
    class={cn(
      "origin-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      open ? "scale-0 opacity-0" : "scale-100 opacity-100"
    )}
  />
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    d="M6 18L18 6M6 6l12 12"
    class={cn(
      "origin-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      open ? "scale-100 opacity-100" : "scale-0 opacity-0"
    )}
  />
</svg>
