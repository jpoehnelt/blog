<script lang="ts">
  import { tv, type VariantProps } from "tailwind-variants";
  import { cn } from "$lib/utils.js";
  import type { Snippet } from "svelte";

  const actionLinkVariants = tv({
    base: "hover:underline inline-flex items-center gap-1 transition-colors",
    variants: {
      variant: {
        muted: "text-xs text-muted-foreground",
        uppercase: "text-xs font-bold uppercase tracking-wider block",
      },
    },
    defaultVariants: {
      variant: "muted",
    },
  });

  type Variant = VariantProps<typeof actionLinkVariants>["variant"];

  interface Props {
    href: string;
    variant?: Variant;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { href, variant = "muted", class: className, children, ...rest }: Props = $props();
</script>

<a
  {href}
  class={cn(actionLinkVariants({ variant }), className)}
  {...rest}
>
  {@render children?.()}
</a>
