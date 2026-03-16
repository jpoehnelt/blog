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

  let state = $derived.by(() => {
    if (value === null) {
      return { diffClass: "text-slate-200", iconClass: "", textClass: "text-slate-200", type: "null" };
    }
    if (value === 0) {
      return { diffClass: "text-slate-300", iconClass: "text-slate-300", textClass: "", type: "zero" };
    }
    if (value > 0) {
      return { diffClass: "text-green-500", iconClass: "text-green-500", textClass: "tabular-nums", type: "up" };
    }
    return { diffClass: "text-red-500", iconClass: "text-red-500", textClass: "tabular-nums", type: "down" };
  });
</script>

<div
  class={cn("flex items-center justify-end gap-1 text-xs font-bold w-full", state.diffClass, className)}
  {...rest}
>
  {#if state.type === "null"}
    <span class={state.textClass}>-</span>
  {:else if state.type === "zero"}
    <Minus class={cn("w-3 h-3", state.iconClass)} />
  {:else if state.type === "up"}
    <ArrowUp class={cn("w-3 h-3", state.iconClass)} />
    <span class={state.textClass}>+{value}</span>
  {:else}
    <ArrowDown class={cn("w-3 h-3", state.iconClass)} />
    <span class={state.textClass}>{value}</span>
  {/if}
</div>
