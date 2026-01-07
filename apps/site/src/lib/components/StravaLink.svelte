<script lang="ts">
  import { socialIcons } from "$lib/social-icons";
  import { cn } from "$lib/utils";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  interface Props extends HTMLAnchorAttributes {
    activityId: number | string;
  }

  let { activityId, class: className, ...rest }: Props = $props();
</script>

<a
  href={`https://www.strava.com/activities/${activityId}`}
  target="_blank"
  rel="noopener noreferrer"
  class={cn(
    "inline-flex items-center gap-2 hover:text-[#fc4c02] text-gray-500 hover:underline font-medium",
    className
  )}
  title="View on Strava"
  {...rest}
>
  <svg
    class="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d={socialIcons.strava} />
  </svg>
</a>
