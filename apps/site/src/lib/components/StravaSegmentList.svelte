<script lang="ts">
  import StravaSegmentListItem, { type SegmentEffort } from "$lib/components/StravaSegmentListItem.svelte";

  interface Props {
    segments?: SegmentEffort[];
  }

  let { segments = [] }: Props = $props();
</script>

{#if segments && segments.length > 0}
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Segments</h3>
    <ul class="grid gap-2">
      {#each segments as segment}
        <StravaSegmentListItem {segment} />
      {/each}
    </ul>
  </div>
{/if}
