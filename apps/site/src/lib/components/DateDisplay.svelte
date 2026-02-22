<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    date: Date | string | number | null | undefined;
    format?: Intl.DateTimeFormatOptions;
    class?: string;
    [key: string]: any;
  }

  let {
    date,
    format = {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
    class: className,
    ...rest
  }: Props = $props();

  let validDate = $derived(date ? new Date(date) : null);
  let isoString = $derived(
    validDate && !isNaN(validDate.getTime()) ? validDate.toISOString() : undefined
  );
  let formattedDate = $derived(
    validDate && !isNaN(validDate.getTime())
      ? validDate.toLocaleDateString("en-US", format)
      : ""
  );
</script>

<time datetime={isoString} class={cn(className)} {...rest}>
  {formattedDate}
</time>
