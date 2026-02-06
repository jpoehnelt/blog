<script lang="ts">
  import { tv } from "tailwind-variants";
  import ExternalLink from "$lib/components/ExternalLink.svelte";

  interface Props {
    name: string;
    url: string;
    icon: string;
    variant?: "default" | "mobile";
    class?: string;
    [key: string]: any;
  }

  let {
    name,
    url,
    icon,
    variant = "default",
    class: className,
    ...rest
  }: Props = $props();

  const link = tv({
    base: "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
    variants: {
      variant: {
        default: "text-foreground/60 hover:text-foreground p-1",
        mobile:
          "px-4 py-3 text-base font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground flex items-center gap-3 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  });
</script>

<ExternalLink
  href={url}
  class={link({ variant, class: className })}
  aria-label={variant === "default" ? name : undefined}
  {...rest}
>
  <svg
    class="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d={icon} />
  </svg>
  {#if variant === "mobile"}
    {name}
  {:else}
    <span class="sr-only">{name}</span>
  {/if}
</ExternalLink>
