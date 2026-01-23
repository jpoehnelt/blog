<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { tv, type VariantProps } from "tailwind-variants";

  const navLinkVariants = tv({
    base: "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded font-medium",
    variants: {
      variant: {
        default: "relative px-3 py-2 text-sm hover:text-foreground/80",
        mobile: "px-4 py-3 text-lg hover:bg-accent hover:text-accent-foreground rounded-md",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        active: true,
        class: "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground",
      },
      {
        variant: "default",
        active: false,
        class: "text-foreground/60",
      },
      {
        variant: "mobile",
        active: true,
        class: "bg-accent text-accent-foreground",
      },
      {
        variant: "mobile",
        active: false,
        class: "text-foreground/80",
      },
    ],
    defaultVariants: {
      variant: "default",
      active: false,
    },
  });

  type NavLinkVariant = VariantProps<typeof navLinkVariants>["variant"];

  interface Props {
    href: string;
    active?: boolean;
    variant?: NavLinkVariant;
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    href,
    active = false,
    variant = "default",
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<a
  {href}
  class={cn(navLinkVariants({ variant, active }), className)}
  aria-current={active ? "page" : undefined}
  {...rest}
>
  {@render children?.()}
</a>
