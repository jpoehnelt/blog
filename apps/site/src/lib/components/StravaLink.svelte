<script lang="ts">
  import { socialIcons } from "$lib/social-icons";

  export let activityId: number | string;
</script>

<a
  href={`https://www.strava.com/activities/${activityId}`}
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-2 hover:text-[#fc4c02] text-gray-500 hover:underline font-medium"
  title="View on Strava"
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
