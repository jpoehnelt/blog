<script lang="ts">
  let { id, embed = "8e7a8cf9f2e8f7e3b0e6b7e8f2e8f7e3b0e6b7e8" }: { id: string; embed?: string } = $props();
</script>

<div class="flex justify-center">
  <iframe
    loading="lazy"
    title="strava activity"
    class="w-full max-w-sm h-96"
    frameborder="0"
    scrolling="no"
    src={`https://www.strava.com/activities/${id}/embed/${embed}`}
  ></iframe>
</div>
