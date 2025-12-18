<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import Clipboard from "@lucide/svelte/icons/clipboard";
  import Check from "@lucide/svelte/icons/check";
  import BrandIcon from "$lib/components/BrandIcon.svelte";
  import * as icons from "simple-icons";
  import { cn } from "$lib/utils";

  let { content = "", language = "", class: className = "" } = $props();
  let copied = $state(false);

  const iconMap: Record<string, any> = {
    typescript: icons.siTypescript,
    ts: icons.siTypescript,
    javascript: icons.siJavascript,
    js: icons.siJavascript,
    python: icons.siPython,
    py: icons.siPython,
    svelte: icons.siSvelte,
    bash: icons.siGnubash,
    sh: icons.siGnubash,
    html: icons.siHtml5,
    css: icons.siCss3,
    json: icons.siJson,
    md: icons.siMarkdown,
    markdown: icons.siMarkdown,
    rust: icons.siRust,
    rs: icons.siRust,
    go: icons.siGo,
    dockerfile: icons.siDocker,
    docker: icons.siDocker,
    yaml: icons.siYaml,
    yml: icons.siYaml,
  };

  const icon = $derived(iconMap[language.toLowerCase()]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 5_000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }
</script>

<div
  class={cn(
    "absolute top-0 right-0 flex items-center justify-between gap-0.5 px-3 py-1 text-lg z-10",
    className
  )}
>
  <Button variant="ghost" size="icon" onclick={copyToClipboard}>
    {#if copied}
      <Check class="text-green-500" />
    {:else}
      <Clipboard />
    {/if}
    <span class="sr-only">Copy code to clipboard</span>
  </Button>
  {#if icon}
    <BrandIcon {icon} size={14} />
  {/if}
</div>
