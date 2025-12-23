<script>
  /**
   * @typedef {Object} Props
   * @property {string} src
   * @property {string} [description]
   * @property {string} code
   */

  /** @type {Props} */
  let { src, description = "", code = "<pre>No code loaded</pre>" } = $props();
</script>

<div class="my-4 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
  <div class="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
    <span class="font-mono text-xs text-muted-foreground">{src}</span>
    {#if description}
      <span class="text-xs text-muted-foreground">{description}</span>
    {/if}
  </div>
  <div id={src} class="p-0">
    {@html code}
  </div>
</div>
