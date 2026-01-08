<script lang="ts">
  import { socialIcons } from "$lib/social-icons";
  import { cn } from "$lib/utils";

  interface Props {
    activityId: number | string;
    class?: string;
    iconClass?: string;
    [key: string]: any;
  }

  let {
    activityId,
    class: className,
    iconClass,
    ...rest
  }: Props = $props();
</script>

<a
  href={`https://www.strava.com/activities/${activityId}`}
  target="_blank"
  rel="noopener noreferrer"
  class={cn(
    "inline-flex items-center gap-2 hover:text-[#fc4c02] text-gray-500 hover:underline font-medium transition-colors",
    className
  )}
  title="View on Strava"
  aria-label="View on Strava (opens in a new tab)"
  {...rest}
>
  <svg
    class={cn("size-5", iconClass)}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d={socialIcons.strava} />
  </svg>
</a>
