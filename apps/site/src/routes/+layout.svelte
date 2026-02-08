<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import AdProvider from "$lib/components/AdProvider.svelte";
  import { getDefaultSocialLinks } from "$lib/social-icons";
  import { AUTHOR_NAME, PROMPT_SYSTEM } from "$lib/constants";
  import { onMount } from "svelte";
  import { onNavigate } from "$app/navigation";
  import { sendEvent } from "$lib/analytics";

  import "../app.css";
  let { children } = $props();

  // Configure your social links here
  const socialLinks = getDefaultSocialLinks({
    github: "https://github.com/jpoehnelt",
    linkedin: "https://www.linkedin.com/in/justin-poehnelt",
    strava: "https://www.strava.com/athletes/2170160",
    // twitter: "https://twitter.com/yourhandle",
    // bluesky: "https://bsky.app/profile/yourhandle",
    // email: "your@email.com",
    rss: true,
  });

  // Use constant to avoid hydration mismatch
  const currentYear = new Date().getFullYear();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  onMount(() => {
    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  });

  function handleGlobalClick(event: MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;

    const url = anchor.href;
    const text = anchor.innerText;
    const domain = anchor.hostname;
    const outbound = anchor.host !== window.location.host;

    sendEvent("link_click", {
      link_url: url,
      link_text: text,
      outbound,
      link_domain: domain,
    });
  }
</script>

<svelte:head>
  <!-- Google tag (gtag.js) -->
  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=G-67SN6HNB0B"
  ></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-67SN6HNB0B");
  </script>
</svelte:head>

<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring focus:rounded-md focus:shadow-lg font-medium"
>
  Skip to content
</a>

<Navbar {socialLinks} />

<AdProvider>
  <div
    id="main-content"
    tabindex="-1"
    class="outline-none flex flex-col flex-1"
  >
    {@render children()}
  </div>
</AdProvider>

<footer class="mt-auto py-8 border-t">
  <div
    class="container mx-auto px-4 text-center text-sm text-muted-foreground flex flex-col gap-2 items-center"
  >
    <p>Copyright © {currentYear} {AUTHOR_NAME}</p>
    <p class="text-[0.3rem] overflow-hidden uppercase prose">{PROMPT_SYSTEM}</p>
  </div>
</footer>
