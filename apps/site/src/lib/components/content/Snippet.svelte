<script lang="ts">
  import BrandIcon from "$lib/components/BrandIcon.svelte";
  import CodeToolbar from "$lib/components/CodeToolbar.svelte";
  import { LANG_ICON_MAP } from "$lib/constants";

  interface Props {
    src: string;
    description?: string;
    githubUrl?: string;
    rawContent: string;
    code: string;
  }

  let { src, description = "", githubUrl, rawContent, code }: Props = $props();

  if (!code) {
    throw new Error(`Snippet code not loaded for: ${src}`);
  }

  const displaySrc = $derived(src.split("/").pop() || "");

  const ext = $derived(src.split(".").pop()?.toLowerCase() || "");
  const icon = $derived(
    (LANG_ICON_MAP as Record<string, any>)[ext] ||
      (ext === "gs" ? LANG_ICON_MAP.javascript : null)
  );
</script>

<div
  class="snippet-component my-4 overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm relative group"
>
  <div
    class="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/50 px-4 py-2 no-md"
  >
    <div class="flex items-center gap-2">
      {#if icon}
        <BrandIcon {icon} size={14} />
      {/if}
      <div class="flex gap-2 text-xs font-mono">
        {#if githubUrl}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-zinc-500 hover:text-zinc-900 hover:underline"
          >
            {displaySrc}
          </a>
        {:else}
          <span class="text-zinc-500">{displaySrc}</span>
        {/if}
      </div>
    </div>
    <div class="flex items-center gap-2">
      {#if description}
        <span class="text-xs text-zinc-500">{description}</span>
      {/if}
      <CodeToolbar
        content={rawContent}
        language={ext}
        class="static transform-none p-0 bg-transparent flex text-zinc-500 hover:text-zinc-900"
      />
    </div>
  </div>
  <div
    id={src}
    class="p-0 [&_pre]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent [&_pre]:!px-4 [&_pre]:!py-3"
  >
    {@html code}
  </div>
</div>
