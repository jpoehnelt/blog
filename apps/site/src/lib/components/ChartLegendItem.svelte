<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    active?: boolean;
    color?: string; // Expects a Tailwind color class like "bg-indigo-500"
    icon?: Snippet; // Optional custom icon
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    label,
    active = true,
    color,
    icon,
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<button
  class={cn(
    "flex items-center gap-1.5 transition-opacity hover:opacity-80",
    active ? 'opacity-100' : 'opacity-40 grayscale',
    className
  )}
  aria-pressed={active}
  type="button"
  {...rest}
>
  {#if icon}
    {@render icon()}
  {:else if color}
    <div class="flex items-center" aria-hidden="true">
      <div class={cn("w-2 h-0.5", color)}></div>
      <div class={cn("w-1.5 h-1.5 rounded-full -ml-0.5", color)}></div>
      <div class={cn("w-2 h-0.5 -ml-0.5", color)}></div>
    </div>
  {:else if children}
    {@render children()}
  {/if}
  <span class="text-xs font-bold text-slate-600">{label}</span>
</button>
