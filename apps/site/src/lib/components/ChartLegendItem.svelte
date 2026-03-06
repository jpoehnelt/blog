<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  interface Props extends HTMLButtonAttributes {
    label: string;
    active?: boolean;
    color?: string; // e.g., 'bg-indigo-500', 'text-indigo-500'
    icon?: Snippet;
  }

  let {
    label,
    active = true,
    color,
    icon,
    class: className,
    ...rest
  }: Props = $props();
</script>

<button
  type="button"
  class={cn(
    "flex items-center gap-1.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
    active ? "opacity-100" : "opacity-40 grayscale",
    className
  )}
  aria-pressed={active}
  {...rest}
>
  {#if icon}
    {@render icon()}
  {:else if color}
    <!-- Default solid circle icon if only color is provided -->
    <div class={cn("w-2 h-2 rounded-full", color)}></div>
  {/if}
  <span class="text-xs font-bold text-slate-600">{label}</span>
</button>
