<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { getDefaultSocialLinks } from "$lib/social-icons";
  import { AUTHOR_NAME, PROMPT_SYSTEM } from "$lib/constants";
  import CodeToolbar from "$lib/components/CodeToolbar.svelte";
  import { mount, onMount } from "svelte";
  import { afterNavigate, onNavigate } from "$app/navigation";
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

  afterNavigate(() => {
    addCodeToolbar();
  });

  onMount(() => {
    addCodeToolbar();
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

  function addCodeToolbar() {
    for (const node of document.querySelectorAll("pre > code")) {
      const languageMatch = node.className.match(/language-(\w+)/);
      const language = languageMatch ? languageMatch[1] : "";

      mount(CodeToolbar, {
        target: node.parentElement!,
        anchor: node,
        props: {
          content: node.textContent ?? "",
          language: language,
        },
      });
    }
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

<Navbar {socialLinks} />

{@render children()}

<footer class="mt-auto py-8 border-t">
  <div
    class="container mx-auto px-4 text-center text-sm text-muted-foreground flex flex-col gap-2 items-center"
  >
    <p>Copyright © {currentYear} {AUTHOR_NAME}</p>
    <p class="text-[0.3rem] overflow-hidden uppercase prose">{PROMPT_SYSTEM}</p>
  </div>
</footer>
