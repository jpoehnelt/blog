<script lang="ts">
  import { onMount, tick } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { setAds } from "$lib/ads.svelte";

  const AD_CLIENT = "ca-pub-1251836334060830";
  const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;

  let { children } = $props();

  const ads = setAds();

  // Push all ads after every navigation (SPA page transitions + initial load)
  afterNavigate(() => {
    tick().then(() => ads.pushAllAds());
  });

  // Also push when status transitions to "allowed" (script may load after DOM)
  $effect(() => {
    // Set data attribute for CSS-driven ad visibility
    document.documentElement.dataset.ads = ads.status;
    if (ads.status === "allowed") {
      ads.pushAllAds();
    }
  });

  onMount(() => {
    // Check if the script is already loaded
    const existing = document.querySelector(`script[src="${ADSENSE_SRC}"]`);

    if (existing) {
      // Script tag exists — check if it actually loaded (ad blocker detection)
      detectBlocker();
      return;
    }

    // Dynamically load the script
    const script = document.createElement("script");
    script.src = ADSENSE_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      detectBlocker();
    };

    script.onerror = () => {
      ads.status = "blocked";
    };

    document.head.appendChild(script);
  });

  function detectBlocker() {
    setTimeout(() => {
      if (typeof (window as any).adsbygoogle === "undefined") {
        ads.status = "blocked";
      } else {
        ads.status = "allowed";
      }
    }, 200);
  }
</script>

{@render children()}
