<script lang="ts">
  import { cn } from "$lib/utils";
  import type { Picture } from "vite-imagetools";

  let {
    src,
    alt,
    class: className = "",
    displayLabel = true,
    loading = "lazy",
    fetchpriority = "auto",
    sizes,
  }: {
    src: string | Picture | object;
    alt: string;
    class?: string;
    displayLabel?: boolean;
    loading?: "lazy" | "eager";
    fetchpriority?: "auto" | "high" | "low";
    sizes?: string;
  } = $props();

  const resolvedSrc = $derived(src);

  // Check if resolvedSrc is an enhanced image object or a URL string
  const isEnhancedImage = $derived(
    typeof resolvedSrc === "object" && resolvedSrc !== null
  );

  // For enhanced images, get the img src for the link
  const linkHref = $derived(
    isEnhancedImage ? (resolvedSrc as any).img?.src || "#" : (resolvedSrc as string)
  );
</script>

<div class="flex flex-col gap-3">
  <a
    href={linkHref}
    aria-label={`View full size image: ${alt}`}
    data-original-src={typeof src === 'string' ? src : 'enhanced-image'}
  >
    {#if isEnhancedImage}
      <!-- @ts-ignore -->
      <enhanced:img
        src={resolvedSrc as string | Picture}
        {alt}
        class={cn("rounded-sm mx-auto", className)}
        data-original-src={typeof src === 'string' ? src : 'enhanced-image'}
        {loading}
        {fetchpriority}
        {sizes}
      />
    {:else}
      <img
        src={resolvedSrc as string}
        {alt}
        class={cn("rounded-sm mx-auto", className)}
        data-original-src={src}
        {loading}
        {fetchpriority}
        {sizes}
      />
    {/if}
  </a>
  {#if displayLabel}<p class="text-xs italic text-center mt-0">{alt}</p>{/if}
</div>
