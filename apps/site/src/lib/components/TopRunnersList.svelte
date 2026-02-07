<script lang="ts">
  import type { Participant } from "@jpoehnelt/ultrasignup-scraper/types";

  interface Props {
    list: Participant[];
    title: string;
    theme: "blue" | "rose";
  }

  let { list, title, theme }: Props = $props();

  let isExpanded = $state(false);
</script>

<div
  class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden h-full flex flex-col"
>
  <div
    class="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center"
  >
    <h3 class="font-bold text-slate-800 flex items-center gap-2">
      <span
        class={`w-2 h-2 rounded-full ${theme === "blue" ? "bg-blue-600" : "bg-rose-500"}`}
      ></span>
      {title}
    </h3>
    <span class="text-xs font-semibold text-stone-400 uppercase tracking-wide"
      >Rank Score</span
    >
  </div>
  <div class="divide-y divide-stone-100 flex-1">
    {#each list.slice(0, isExpanded ? undefined : 5) as m}
      <div
        class="px-6 py-4 hover:bg-stone-50 transition-colors flex items-center gap-4 group"
      >
        <div
          class={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-stone-100 ${theme === "blue" ? "bg-slate-100 text-slate-500" : "bg-rose-50 text-rose-500"}`}
        >
          {m.firstName[0]}{m.lastName[0]}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-baseline mb-1">
            <div
              class={`font-bold text-slate-800 truncate transition-colors ${theme === "blue" ? "group-hover:text-blue-700" : "group-hover:text-rose-600"}`}
            >
              {m.firstName}
              {m.lastName}
            </div>
            <div
              class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full"
            >
              {m.results} results
            </div>
          </div>
          <div
            class="relative h-2 w-full bg-stone-100 rounded-full overflow-hidden"
          >
            <div
              class={`absolute h-full rounded-full transition-all duration-500 ease-out ${theme === "blue" ? "bg-blue-500" : "bg-rose-500"}`}
              style="width: {m.rank}%"
            ></div>
          </div>
          <div class="flex justify-between mt-1.5 text-xs text-stone-500">
            <div class="flex items-center gap-1">
              <svg
                class="w-3 h-3 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                /><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                /></svg
              >
              {m.location || "Unknown"}
            </div>
            <span class="font-mono font-bold text-slate-700"
              >{m.rank ? m.rank.toFixed(1) : "N/A"}%</span
            >
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if list.length > 5}
    <div class="p-3 border-t border-stone-100 flex justify-center bg-stone-50/30">
        <button 
            onclick={() => isExpanded = !isExpanded}
            class={`text-xs font-semibold ${theme === "blue" ? "text-blue-600 hover:text-blue-700" : "text-rose-600 hover:text-rose-700"} transition-colors flex items-center gap-1 bg-white border border-stone-200 rounded-full px-4 py-1.5 shadow-sm hover:shadow`}
        >
            {isExpanded ? "Show Less" : "Show More"}
            <svg class="w-3 h-3 {isExpanded ? 'rotate-180' : ''} transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    </div>
  {/if}
</div>
