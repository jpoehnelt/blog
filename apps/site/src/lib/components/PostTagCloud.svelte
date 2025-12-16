<script lang="ts">
  import TagButton from '$lib/components/TagButton.svelte';

  let { tags }: { tags: { tag: string; count: number }[] } = $props();
</script>

<div class="flex flex-wrap gap-2">
  {#each tags as { tag, count } (tag)}
    <TagButton {tag} {count} />
  {/each}
</div>
