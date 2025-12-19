<script lang="ts">
  import type { Thing, WithContext } from "schema-dts";

  interface Props {
    schema: WithContext<Thing> | WithContext<Thing>[];
  }

  let { schema }: Props = $props();
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>
