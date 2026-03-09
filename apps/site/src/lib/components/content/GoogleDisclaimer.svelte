<script lang="ts">
  import Note from "$lib/components/content/Note.svelte";

  import { isGoogleRelated } from "$lib/utils";

  let { tags = [] }: { tags?: string[] } = $props();

  let showDisclaimer = $derived(isGoogleRelated(tags) || tags.some(t => t.toLowerCase() === 'code'));
</script>

{#if showDisclaimer}
  <Note>
    Opinions are my own and not the views of my employer.
  </Note>
{/if}
