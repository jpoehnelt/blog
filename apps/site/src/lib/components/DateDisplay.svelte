<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    date: Date | string | number | null;
    format?: Intl.DateTimeFormatOptions;
    class?: string;
    [key: string]: any;
  }

  let {
    date,
    format = {},
    class: className,
    ...rest
  }: Props = $props();

  let dateObj = $derived(date ? new Date(date) : null);

  let formatted = $derived.by(() => {
    if (!dateObj || isNaN(dateObj.getTime())) return "";

    // If specific format options are provided, use them with UTC default.
    // Otherwise use standard date format.
    const hasCustomFormat = Object.keys(format).length > 0;

    if (hasCustomFormat) {
       return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...format }).format(dateObj);
    }

    return new Intl.DateTimeFormat("en-US", {
       year: "numeric",
       month: "short",
       day: "numeric",
       timeZone: "UTC"
    }).format(dateObj);
  });

  let isoString = $derived(dateObj && !isNaN(dateObj.getTime()) ? dateObj.toISOString() : undefined);
</script>

{#if dateObj && !isNaN(dateObj.getTime())}
  <time datetime={isoString} class={cn(className)} {...rest}>
    {formatted}
  </time>
{/if}
