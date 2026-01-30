<script lang="ts">
  import { createSvelteTable, FlexRender, renderSnippet } from "$lib/components/ui/data-table";
  import {
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type SortingState,
  } from "@tanstack/table-core";

  interface WaitlistApplicant {
    name: string;
    position: number;
    d1: number | null;
    d7: number | null;
    d30: number | null;
  }

  interface Props {
    applicants: WaitlistApplicant[];
    eventId: string;
  }

  let { applicants, eventId }: Props = $props();

  // TanStack Table state
  let sorting = $state<SortingState>([{ id: "position", desc: false }]);
  let globalFilter = $state("");

  // Column definitions
  const columns: ColumnDef<WaitlistApplicant>[] = [
    {
      id: "position",
      accessorKey: "position",
      header: "Pos",
      cell: ({ row }) => row.original.position,
      enableSorting: true,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
      enableSorting: true,
    },
    {
      id: "d1",
      accessorKey: "d1",
      header: "1D",
      cell: ({ row }) => row.original.d1,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.d1 ?? -Infinity;
        const b = rowB.original.d1 ?? -Infinity;
        return a - b;
      },
    },
    {
      id: "d7",
      accessorKey: "d7",
      header: "7D",
      cell: ({ row }) => row.original.d7,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.d7 ?? -Infinity;
        const b = rowB.original.d7 ?? -Infinity;
        return a - b;
      },
    },
    {
      id: "d30",
      accessorKey: "d30",
      header: "30D",
      cell: ({ row }) => row.original.d30,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.d30 ?? -Infinity;
        const b = rowB.original.d30 ?? -Infinity;
        return a - b;
      },
    },
  ];

  // Create the table
  let table = $derived(
    createSvelteTable({
      data: applicants,
      columns,
      state: {
        sorting,
        globalFilter,
      },
      onSortingChange: (updater) => {
        sorting = typeof updater === "function" ? updater(sorting) : updater;
      },
      onGlobalFilterChange: (updater) => {
        globalFilter = typeof updater === "function" ? updater(globalFilter) : updater;
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      globalFilterFn: (row, _columnId, filterValue) => {
        return row.original.name.toLowerCase().includes(filterValue.toLowerCase());
      },
    })
  );

  function getChangeClass(diff: number | null): string {
    if (diff === null) return "text-slate-200";
    if (diff === 0) return "text-slate-300";
    return "text-green-500";
  }
</script>

{#snippet ChangeIndicator(diff: number | null)}
  <div
    class={`flex items-center justify-end gap-1 text-xs font-bold w-full ${getChangeClass(diff)}`}
  >
    {#if diff === null}
      <span class="text-slate-200">-</span>
    {:else if diff === 0}
      <svg class="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14" />
      </svg>
    {:else if diff > 0}
      <svg class="w-3 h-3 text-green-500 fill-current" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <span class="tabular-nums">+{diff}</span>
    {:else}
      <svg class="w-3 h-3 text-red-500 fill-current" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      <span class="tabular-nums">{diff}</span>
    {/if}
  </div>
{/snippet}

<div class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
  <div class="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
    <h3 class="font-bold text-slate-800 flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-orange-500"></span>
      Waitlist Applicants
      <span class="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
        {applicants.length} Total
      </span>
    </h3>
    <div class="relative w-full md:w-64">
      <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg class="w-4 h-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
        </svg>
      </div>
      <input
        type="text"
        id={`search-${eventId}`}
        class="block w-full p-2 ps-10 text-sm text-slate-700 border border-slate-200 rounded-lg bg-white focus:ring-orange-500 focus:border-orange-500"
        placeholder="Search applicants..."
        bind:value={globalFilter}
      />
    </div>
  </div>

  <div class="overflow-x-auto max-h-[800px] overflow-y-auto">
    <table class="w-full text-sm text-left">
      <thead class="text-xs text-slate-500 uppercase bg-stone-50 sticky top-0 z-10 shadow-sm">
        {#each table.getHeaderGroups() as headerGroup}
          <tr>
            {#each headerGroup.headers as header}
              <th
                class="px-4 py-3 {header.id === 'position' ? 'w-16 text-center' : ''} {header.id === 'name' ? '' : 'text-right'}"
              >
                {#if header.column.getCanSort()}
                  <button
                    onclick={() => header.column.toggleSorting()}
                    class="font-semibold transition-colors flex items-center gap-1 {header.id !== 'name' ? 'justify-end w-full' : ''} {header.column.getIsSorted() ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700'}"
                  >
                    <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                    {#if header.column.getIsSorted() === "asc"}
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      </svg>
                    {:else if header.column.getIsSorted() === "desc"}
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    {/if}
                  </button>
                {:else}
                  <span class="font-semibold">
                    <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                  </span>
                {/if}
              </th>
            {/each}
          </tr>
        {/each}
      </thead>
      <tbody class="divide-y divide-stone-100 bg-white">
        {#each table.getRowModel().rows as row}
          <tr class="hover:bg-orange-50/50 transition-colors group">
            <td class="px-4 py-3 font-mono text-xs text-slate-400 text-center">{row.original.position}</td>
            <td class="px-4 py-3 font-medium text-slate-700">
              <a
                href={`https://ultrasignup.com/results_participant.aspx?fname=${row.original.name.split(" ")[0]}&lname=${row.original.name.split(" ").slice(1).join(" ")}`}
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-orange-600 hover:underline transition-colors"
              >
                {row.original.name}
              </a>
            </td>
            <td class="px-4 py-3 text-right">{@render ChangeIndicator(row.original.d1)}</td>
            <td class="px-4 py-3 text-right">{@render ChangeIndicator(row.original.d7)}</td>
            <td class="px-4 py-3 text-right">{@render ChangeIndicator(row.original.d30)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
