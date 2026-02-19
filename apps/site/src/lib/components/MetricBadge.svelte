<script lang="ts">
  import { tv, type VariantProps } from "tailwind-variants";
  import { cn } from "$lib/utils.js";
  import type { Snippet } from "svelte";

  const metricBadgeVariants = tv({
    base: "inline-flex items-center gap-1.5 rounded font-bold whitespace-nowrap",
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
        green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
        yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2 py-1",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  });

  type MetricBadgeVariant = VariantProps<typeof metricBadgeVariants>;

  interface Props {
    variant?: MetricBadgeVariant["variant"];
    size?: MetricBadgeVariant["size"];
    class?: string;
    icon?: Snippet;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    variant = "neutral",
    size = "md",
    class: className,
    icon,
    children,
    ...rest
  }: Props = $props();
</script>

<span class={cn(metricBadgeVariants({ variant, size }), className)} {...rest}>
  {@render icon?.()}
  {@render children?.()}
</span>
