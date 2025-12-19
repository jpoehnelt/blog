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

    // Try direct lookup first (for "foo.jpg")
    if (images[src]) {
      return images[src];
    }

    // Handle legacy prefixes if present (e.g. "src/lib/images/foo.jpg")
    // Use a regex or hardcoded check. Since we are moving to "no prefix", just checking endsWith or stripping known prefixes is fine.
    // But honestly, if we batch update all MD files, we might not need this.
    // Let's keep a robust fallback just in case.
    const cleanSrc = src.replace(/^(src\/images\/|src\/lib\/images\/)/, "");
    if (images[cleanSrc]) {
      console.warn(`Using legacy prefix for image: ${src}`);
      return images[cleanSrc];
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
  <a
    href={linkHref}
    aria-label={`View full size image: ${alt}`}
    data-original-src={src}
  >
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
