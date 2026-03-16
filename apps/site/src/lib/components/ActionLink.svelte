<script lang="ts">
  import { tv } from "tailwind-variants";

  interface Props {
    href: string;
    variant?: "muted" | "uppercase";
    class?: string;
    children?: import('svelte').Snippet;
    [key: string]: any;
  }

  let {
    href,
    variant = "muted",
    class: className,
    children,
    ...rest
  }: Props = $props();

  const link = tv({
    base: "text-xs hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
    variants: {
      variant: {
        muted: "text-muted-foreground",
        uppercase: "font-bold uppercase tracking-wider",
      },
    },
    defaultVariants: {
      variant: "muted",
    },
  });
</script>

<a
  {href}
  class={link({ variant, class: className })}
  {...rest}
>
  {@render children?.()}
</a>
