<script lang="ts">
  import { cn } from "$lib/utils.js";
  import ArrowUp from "@lucide/svelte/icons/arrow-up";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import Minus from "@lucide/svelte/icons/minus";

  interface Props {
    value: number | null;
    class?: string;
    [key: string]: any;
  }

  let { value, class: className, ...rest }: Props = $props();

  let colorClass = $derived.by(() => {
    if (value === null) return "text-slate-200";
    if (value === 0) return "text-slate-300";
    if (value > 0) return "text-green-500";
    return "text-red-500";
  });
</script>

<div
  class={cn("flex items-center gap-1 text-xs font-bold tabular-nums", colorClass, className)}
  aria-label={value !== null ? (value > 0 ? `Increased by ${value}` : value < 0 ? `Decreased by ${Math.abs(value)}` : "No change") : "No data"}
  {...rest}
>
  {#if value === null}
    <span class="text-slate-200" aria-hidden="true">-</span>
  {:else if value === 0}
    <Minus class="w-3 h-3 text-slate-300" aria-hidden="true" />
  {:else if value > 0}
    <ArrowUp class="w-3 h-3 text-green-500" aria-hidden="true" />
    <span>+{value}</span>
  {:else}
    <ArrowDown class="w-3 h-3 text-red-500" aria-hidden="true" />
    <span>{value}</span>
  {/if}
</div>
