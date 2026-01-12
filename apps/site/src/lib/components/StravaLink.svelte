<script lang="ts">
  import { socialIcons } from "$lib/social-icons";
  import { cn } from "$lib/utils.js";

  interface Props {
    activityId: number | string;
    class?: string;
    [key: string]: any;
  }

  let { activityId, class: className, ...rest }: Props = $props();
</script>

<a
  href={`https://www.strava.com/activities/${activityId}`}
  target="_blank"
  rel="noopener noreferrer"
  class={cn(
    "inline-flex items-center gap-2 font-medium text-gray-500 hover:text-[#fc4c02] hover:underline",
    className
  )}
  aria-label="View on Strava (opens in a new tab)"
  {...rest}
>
  <svg
    class="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d={socialIcons.strava} />
  </svg>
</a>
