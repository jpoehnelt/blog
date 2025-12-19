<script lang="ts">
  import { images } from "$lib/images";
  import { cn } from "$lib/utils";

  let {
    src,
    alt,
    class: className = "",
    displayLabel = true,
  }: {
    src: string;
    alt: string;
    class?: string;
    displayLabel?: boolean;
  } = $props();

  // Convert old relative paths and resolve to enhanced image objects
  const resolvedSrc = $derived.by(() => {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src; // External URL, use as-is
    }

    if (src.startsWith("src/images/")) {
      // Convert old path format to lookup key
      const imageKey = src.replace("src/images/", "");
      return images[imageKey] || src;
    }

    return src;
  });

  // Check if resolvedSrc is an enhanced image object or a URL string
  const isEnhancedImage = $derived(
    typeof resolvedSrc === "object" && resolvedSrc !== null
  );

  // For enhanced images, get the img src for the link
  const linkHref = $derived(
    isEnhancedImage ? resolvedSrc.img?.src || "#" : resolvedSrc
  );
</script>

<div class="flex flex-col gap-3">
  <a href={linkHref} aria-label={`View full size image: ${alt}`}>
    {#if isEnhancedImage}
      <enhanced:img
        src={resolvedSrc}
        {alt}
        class={cn("rounded-sm mx-auto", className)}
        data-original-src={src}
      />
    {:else}
      <img
        src={resolvedSrc}
        {alt}
        class={cn("rounded-sm mx-auto", className)}
        data-original-src={src}
      />
    {/if}
  </a>
  {#if displayLabel}<p class="text-xs italic text-center mt-0">{alt}</p>{/if}
</div>
