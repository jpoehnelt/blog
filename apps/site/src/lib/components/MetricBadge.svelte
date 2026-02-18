<script lang="ts">
  import { tv } from "tailwind-variants";
  import { cn } from "$lib/utils.js";

  interface Props {
    variant?: "orange" | "purple" | "green" | "neutral";
    class?: string;
    children?: import("svelte").Snippet;
    icon?: import("svelte").Snippet;
    [key: string]: any;
  }

  let {
    variant = "neutral",
    class: className,
    children,
    icon,
    ...rest
  }: Props = $props();

  const badge = tv({
    base: "inline-flex items-center gap-1.5 px-2 py-1 rounded font-bold text-sm",
    variants: {
      variant: {
        orange:
          "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
        purple:
          "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
        green:
          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        neutral:
          "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  });
</script>

<span class={cn(badge({ variant }), className)} {...rest}>
  {#if icon}
    {@render icon()}
  {/if}
  {#if children}
    {@render children()}
  {/if}
</span>
