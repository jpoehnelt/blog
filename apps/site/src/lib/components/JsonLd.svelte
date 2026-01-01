<script lang="ts">
  import type { Thing, WithContext } from "schema-dts";

  interface Props {
    schema: WithContext<Thing> | WithContext<Thing>[];
  }

  let { schema }: Props = $props();

  function serialize(data: any): string {
    const json = JSON.stringify(data);
    return json ? json.replace(/</g, "\\u003c") : "null";
  }
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${serialize(schema)}</script>`}
</svelte:head>
