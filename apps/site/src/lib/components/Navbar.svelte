<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet";
  import ExternalLink from "$lib/components/ExternalLink.svelte";
  import MobileMenuIcon from "$lib/components/MobileMenuIcon.svelte";
  import NavLink from "$lib/components/NavLink.svelte";
  import Search from "$lib/components/Search.svelte";
  import { DEFAULT_TITLE as siteTitle } from "$lib/constants";
  import { page } from "$app/state";

  interface SocialLink {
    name: string;
    url: string;
    icon: string;
  }

  let {
    socialLinks = [],
  }: {
    socialLinks?: SocialLink[];
  } = $props();

  let mobileMenuOpen = $state(false);

  const navLinks: { href: string; label: string }[] = [
    { href: "/#about", label: "About" },
    { href: "/posts", label: "Posts" },
    { href: "/ultras/races", label: "Races" },
  ];
</script>

<header
  class="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/80 supports-[backdrop-filter]:bg-background/60"
>
  <div class="container mx-auto px-4 py-4 flex items-center justify-between">
    <!-- Site Title -->
    <div class="text-xl font-bold">
      <a
        href="/"
        class="hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        aria-label="Home - {siteTitle}"
      >
        {siteTitle}
      </a>
    </div>

    <!-- Desktop Navigation -->
    <nav
      class="hidden md:flex items-center gap-6 ml-auto"
      aria-label="Main navigation"
    >
      <div class="w-64">
        <Search />
      </div>

      <!-- Replacement for NavigationMenu using standard links -->
      <ul class="flex items-center gap-1">
        {#each navLinks as link}
          {@const active =
            link.href === "/"
              ? page.url.pathname === "/"
              : page.url.pathname.startsWith(link.href)}
          <li>
            <NavLink href={link.href} {active}>
              {link.label}
            </NavLink>
          </li>
        {/each}
      </ul>

      <!-- Social Links -->
      {#if socialLinks.length > 0}
        <div
          class="flex items-center gap-2 ml-2 pl-4"
          aria-label="Social links"
        >
          {#each socialLinks as social}
            <ExternalLink
              href={social.url}
              class="text-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
              aria-label={social.name}
            >
              <span class="sr-only">{social.name}</span>
              <svg
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d={social.icon} />
              </svg>
            </ExternalLink>
          {/each}
        </div>
      {/if}
    </nav>

    <!-- Mobile Menu Button -->
    <Sheet.Root bind:open={mobileMenuOpen}>
      <Sheet.Trigger
        class="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        <MobileMenuIcon open={mobileMenuOpen} />
      </Sheet.Trigger>
      <Sheet.Content side="right" class="w-[300px] sm:w-[400px]">
        <Sheet.Header>
          <Sheet.Description class="sr-only"
            >Main navigation menu</Sheet.Description
          >
        </Sheet.Header>
        <nav class="flex flex-col gap-4 mt-6" aria-label="Mobile navigation">
          <div class="px-4">
            <Search />
          </div>
          {#each navLinks as link}
            {@const active =
              link.href === "/"
                ? page.url.pathname === "/"
                : page.url.pathname.startsWith(link.href)}
            <NavLink
              href={link.href}
              {active}
              variant="mobile"
              onclick={() => (mobileMenuOpen = false)}
            >
              {link.label}
            </NavLink>
          {/each}

          {#if socialLinks.length > 0}
            <div class="border-t pt-4 mt-2">
              <p class="px-4 text-sm font-medium text-muted-foreground mb-3">
                Connect
              </p>
              <div class="flex flex-col gap-2">
                {#each socialLinks as social}
                  <ExternalLink
                    href={social.url}
                    class="px-4 py-3 text-base font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center gap-3"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d={social.icon} />
                    </svg>
                    {social.name}
                  </ExternalLink>
                {/each}
              </div>
            </div>
          {/if}
        </nav>
      </Sheet.Content>
    </Sheet.Root>
  </div>
</header>
