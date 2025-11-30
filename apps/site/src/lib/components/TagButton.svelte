<script lang="ts">
  interface Props {
    tag: string;
    count?: number;
  }

  let { tag, count }: Props = $props();
</script>

<a
  href="/tags/{encodeURIComponent(tag)}"
  class="not-prose inline-flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors no-underline text-muted-foreground"
>
  <span>#{tag}</span>
  {#if count !== undefined}
    <span class="text-xs text-muted-foreground">({count})</span>
  {/if}
</a>