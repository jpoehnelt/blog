<script lang="ts">
  import CoffeeIcon from "@lucide/svelte/icons/coffee";
  import LinkIcon from "@lucide/svelte/icons/link";
  import LinkedinIcon from "@lucide/svelte/icons/linkedin";
  import ShareIcon from "@lucide/svelte/icons/share";
  import { siBluesky, siReddit, siX, siYcombinator } from "simple-icons";

  import { resolve } from "$app/paths";

  import BrandIcon from "$lib/components/BrandIcon.svelte";
  import FormattedDate from "$lib/components/FormattedDate.svelte";
  import Head from "$lib/components/Head.svelte";
  import PostCard from "$lib/components/PostCard.svelte";

  import type { PageProps } from "./$types";
  import { url } from "valibot";

  let { data }: PageProps = $props();
</script>

<Head
  title={"Archive"}
  description={"Blog post archive for Justin Poehnelt"}
  pathname={"/posts"}
/>

<main class="container mx-auto prose">
  <ul class="flex flex-col gap-2 max-w-64">
    {#each data.posts as post}
      <li><a href="{post.relativeURL}">{post.title}</a></li>
    {/each}
  </ul>
</main>
