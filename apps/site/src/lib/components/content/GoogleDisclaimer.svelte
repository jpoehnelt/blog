<script lang="ts">
  import Note from "$lib/components/content/Note.svelte";

  import { isGoogleRelated } from "$lib/utils";

  let { tags }: { tags: string[] } = $props();

  let showDisclaimer = $derived(isGoogleRelated(tags));
</script>

{#if showDisclaimer}
  <Note>
    <strong>Disclaimer:</strong> I am a member of the Google Workspace Developer
    Relations team. The opinions expressed here are my own and do not necessarily
    represent those of Google.
  </Note>
{/if}
