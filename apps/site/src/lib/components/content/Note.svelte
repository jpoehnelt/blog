<!--
@component Note
A callout component for highlighting important information with a left border.

@usage
When using in MDX/markdown files, you MUST include blank lines
before and after the content for markdown processing to work correctly.

@example
```svelte
<Note>

**Important:** Make sure to read the [documentation](/docs).

</Note>
```
-->
<script lang="ts">
  let { children } = $props();
</script>

<div
  class="note my-4 p-4 border-l-4 rounded-r border-blue-500 bg-blue-50 dark:bg-blue-950/20"
>
  {@render children()}
</div>

<style>
  .note > :global(:first-child) {
    margin-top: 0;
  }

  .note > :global(:last-child) {
    margin-bottom: 0;
  }
</style>
