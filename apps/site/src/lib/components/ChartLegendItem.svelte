<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    label: string;
    active: boolean;
    colorClass?: string;
    icon?: import("svelte").Snippet;
  }

  let { label, active, colorClass = "", icon, class: className, ...rest }: Props = $props();
</script>

<button
  type="button"
  class={cn(
    "flex items-center gap-1.5 transition-opacity hover:opacity-80",
    active ? "opacity-100" : "opacity-40 grayscale",
    className
  )}
  {...rest}
>
  {#if icon}
    {@render icon()}
  {:else if colorClass}
    <div class="flex items-center">
      <div class={cn("w-2 h-0.5", colorClass)}></div>
      <div class={cn("w-1.5 h-1.5 rounded-full -ml-0.5", colorClass)}></div>
      <div class={cn("w-2 h-0.5 -ml-0.5", colorClass)}></div>
    </div>
  {/if}
  <span class="text-xs font-bold text-slate-600">{label}</span>
</button>
