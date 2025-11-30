<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu";
  import * as Sheet from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
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

  const navLinks = [
    { href: "/posts", label: "Posts" },
    { href: "/tags", label: "Tags" },
  ];

  function isActive(href: string) {
    if (href === "/") {
      return page.url.pathname === "/";
    }
    return page.url.pathname.startsWith(href);
  }
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
    <nav class="hidden md:flex items-center gap-6 ml-auto" aria-label="Main navigation">
      <NavigationMenu.Root class="flex justify-end">
        <NavigationMenu.List class="flex items-center">
          {#each navLinks as link}
            <NavigationMenu.Item>
              <NavigationMenu.Link
                href={link.href}
                class="relative px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded {isActive(
                  link.href
                )
                  ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
                  : 'text-foreground/60'}"
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          {/each}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <!-- Social Links -->
      {#if socialLinks.length > 0}
        <div
          class="flex items-center gap-2 ml-2 border-l pl-4"
          aria-label="Social links"
        >
          {#each socialLinks as social}
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
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
            </a>
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
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {#if mobileMenuOpen}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          {:else}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          {/if}
        </svg>
      </Sheet.Trigger>
      <Sheet.Content side="right" class="w-[300px] sm:w-[400px]">
        <Sheet.Header>
          <Sheet.Description class="sr-only"
            >Main navigation menu</Sheet.Description
          >
        </Sheet.Header>
        <nav class="flex flex-col gap-4 mt-6" aria-label="Mobile navigation">
          {#each navLinks as link}
            <a
              href={link.href}
              class="px-4 py-3 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {isActive(
                link.href
              )
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground/80'}"
              onclick={() => (mobileMenuOpen = false)}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </a>
          {/each}

          {#if socialLinks.length > 0}
            <div class="border-t pt-4 mt-2">
              <p class="px-4 text-sm font-medium text-muted-foreground mb-3">
                Connect
              </p>
              <div class="flex flex-col gap-2">
                {#each socialLinks as social}
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
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
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        </nav>
      </Sheet.Content>
    </Sheet.Root>
  </div>
</header>
