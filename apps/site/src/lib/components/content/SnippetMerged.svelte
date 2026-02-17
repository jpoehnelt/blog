<script lang="ts">
  import BrandIcon from "$lib/components/BrandIcon.svelte";
  import CodeToolbar from "$lib/components/CodeToolbar.svelte";
  import { LANG_ICON_MAP } from "$lib/constants";
  import type { SimpleIcon } from "simple-icons";

  interface Props {
    srcs: string;
    description?: string;
    githubUrls?: string;
    rawContent: string;
    code: string;
  }

  let { srcs, description = "", githubUrls, rawContent, code }: Props = $props();

  if (!code) {
    throw new Error(`SnippetMerged code not loaded for: ${srcs}`);
  }

  const srcList = $derived(srcs.split(","));
  const githubUrlList = $derived(githubUrls ? githubUrls.split(",") : []);
  const displaySrcs = $derived(
    srcList.map((s) => s.trim().split("/").pop() || "")
  );

  const ext = $derived(
    srcList[0]
      ?.trim()
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
  const icon = $derived(
    (LANG_ICON_MAP as Record<string, SimpleIcon>)[ext] ||
      (ext === "gs" ? LANG_ICON_MAP.javascript : null)
  );

  let collapsed = $state(true);
  let overflows = $state(false);
  let codeEl: HTMLDivElement | undefined = $state();

  function checkOverflow(el: HTMLDivElement) {
    overflows = el.scrollHeight > el.clientHeight + 1;
  }

  $effect(() => {
    if (!codeEl) return;

    checkOverflow(codeEl);

    const ro = new ResizeObserver(() => {
      if (codeEl) checkOverflow(codeEl);
    });
    ro.observe(codeEl);

    return () => ro.disconnect();
  });
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
      <div class="flex gap-2 text-xs font-mono flex-wrap">
        {#each displaySrcs as displaySrc, i}
          {#if githubUrlList[i]}
            <a
              href={githubUrlList[i]}
              target="_blank"
              rel="noopener noreferrer"
              class="text-zinc-500 hover:text-zinc-900 hover:underline"
            >
              {displaySrc}
            </a>
          {:else}
            <span class="text-zinc-500">{displaySrc}</span>
          {/if}
          {#if i < displaySrcs.length - 1}
            <span class="text-zinc-300">+</span>
          {/if}
        {/each}
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
    bind:this={codeEl}
    id={srcs.replace(/[^a-zA-Z0-9-]/g, '-')}
    class="p-0 [&_pre]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!px-4 [&_code]:!pt-3 [&_code]:!pb-5 overflow-hidden transition-[max-height] duration-300 ease-in-out"
    style:max-height={collapsed ? '40vh' : 'none'}
  >
    {@html code}
  </div>
  {#if overflows || !collapsed}
    <div class="relative">
      {#if collapsed}
        <div class="absolute bottom-full left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      {/if}
      <button
        onclick={() => { collapsed = !collapsed; }}
        class="w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 bg-zinc-50/80 hover:bg-zinc-100 border-t border-zinc-200 cursor-pointer transition-colors"
      >
        {collapsed ? 'Show more ↓' : 'Show less ↑'}
      </button>
    </div>
  {/if}
</div>

