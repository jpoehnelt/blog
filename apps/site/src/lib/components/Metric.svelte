<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    value: number | string;
    unit?: string;
    icon?: import('svelte').Snippet;
    label?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    value,
    unit,
    icon,
    label,
    class: className,
    ...rest
  }: Props = $props();
</script>

<span
  class={cn("inline-flex items-center gap-1 font-mono text-sm leading-none", className)}
  aria-label={label || (unit ? `${value} ${unit}` : `${value}`)}
  {...rest}
>
  {#if icon}
    <span class="text-muted-foreground shrink-0 self-center" aria-hidden="true">
      {@render icon()}
    </span>
  {/if}
  <span>
    {value}
    {#if unit}
      <span class="text-muted-foreground ml-0.5 text-xs font-normal">{unit}</span>
    {/if}
  </span>
</span>
