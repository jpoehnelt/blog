<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    expanded?: boolean;
    textExpanded?: string;
    textCollapsed?: string;
    variant?: "pill" | "full-width";
    theme?: "default" | "blue" | "rose" | "orange";
    class?: string;
    [key: string]: any;
  }

  let {
    expanded = $bindable(false),
    textExpanded = "Show Less",
    textCollapsed = "Show More",
    variant = "pill",
    theme = "default",
    class: className,
    onclick,
    ...rest
  }: Props = $props();

  function handleClick(e: MouseEvent) {
    expanded = !expanded;
    if (onclick) {
        onclick(e);
    }
  }

  const isPill = $derived(variant === "pill");
  const isFullWidth = $derived(variant === "full-width");
</script>

{#if isPill}
  <button
    type="button"
    aria-expanded={expanded}
    onclick={handleClick}
    class={cn(
      "text-xs font-semibold transition-colors flex items-center justify-center gap-1 rounded-full px-4 py-1.5 shadow-sm hover:shadow h-auto bg-white border border-stone-200",
      {
        "text-slate-500 hover:text-slate-700": theme === "default",
        "text-blue-600 hover:text-blue-700": theme === "blue",
        "text-rose-600 hover:text-rose-700": theme === "rose",
        "text-slate-500 hover:text-orange-600": theme === "orange", // For WaitlistTable
      },
      className
    )}
    {...rest}
  >
    {expanded ? textExpanded : textCollapsed}
    <svg
      class={cn("w-3 h-3 transition-transform", { "rotate-180": expanded })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
{:else if isFullWidth}
  <button
    type="button"
    aria-expanded={expanded}
    onclick={handleClick}
    class={cn(
      "w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 bg-zinc-50/80 hover:bg-zinc-100 border-t border-zinc-200 cursor-pointer transition-colors",
      className
    )}
    {...rest}
  >
    {expanded ? `${textExpanded} ↑` : `${textCollapsed} ↓`}
  </button>
{/if}
