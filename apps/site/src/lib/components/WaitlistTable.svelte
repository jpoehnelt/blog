<script lang="ts">
  import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table";
  import {
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type SortingState,
  } from "@tanstack/table-core";
  import * as Table from "$lib/components/ui/table";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import ArrowUp from "@lucide/svelte/icons/arrow-up";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import Minus from "@lucide/svelte/icons/minus";
  import Search from "@lucide/svelte/icons/search";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";

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
  let isExpanded = $state(false);

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
    class={cn("flex items-center justify-end gap-1 text-xs font-bold w-full", getChangeClass(diff))}
  >
    {#if diff === null}
      <span class="text-slate-200">-</span>
    {:else if diff === 0}
      <Minus class="w-3 h-3 text-slate-300" />
    {:else if diff > 0}
      <ArrowUp class="w-3 h-3 text-green-500" />
      <span class="tabular-nums">+{diff}</span>
    {:else}
      <ArrowDown class="w-3 h-3 text-red-500" />
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
        <Search class="w-4 h-4 text-slate-400" />
      </div>
      <Input
        type="text"
        id={`search-${eventId}`}
        class="pl-10"
        placeholder="Search applicants..."
        bind:value={globalFilter}
      />
    </div>
  </div>

  <div class="overflow-x-auto">
    <Table.Root>
      <Table.Header class="bg-stone-50">
        {#each table.getHeaderGroups() as headerGroup}
          <Table.Row>
            {#each headerGroup.headers as header}
              <Table.Head
                class={cn(
                    "px-4 py-3",
                    header.id === 'position' ? 'w-16 text-center' : '',
                    header.id === 'name' ? '' : 'text-right'
                )}
              >
                {#if header.column.getCanSort()}
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => header.column.toggleSorting()}
                    class={cn(
                        "font-semibold transition-colors flex items-center gap-1 h-auto p-0 hover:bg-transparent",
                        header.id !== 'name' ? 'justify-end w-full' : '',
                        header.column.getIsSorted() ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                    {#if header.column.getIsSorted() === "asc"}
                      <ArrowUp class="w-3 h-3" />
                    {:else if header.column.getIsSorted() === "desc"}
                      <ArrowDown class="w-3 h-3" />
                    {/if}
                  </Button>
                {:else}
                  <span class="font-semibold">
                    <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                  </span>
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body class="divide-y divide-stone-100 bg-white">
        {#each table.getRowModel().rows.slice(0, isExpanded ? undefined : 5) as row}
          <Table.Row class="hover:bg-orange-50/50 transition-colors group">
            <Table.Cell class="px-4 py-3 font-mono text-xs text-slate-400 text-center">{row.original.position}</Table.Cell>
            <Table.Cell class="px-4 py-3 font-medium text-slate-700">
              <a
                href={`https://ultrasignup.com/results_participant.aspx?fname=${row.original.name.split(" ")[0]}&lname=${row.original.name.split(" ").slice(1).join(" ")}`}
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-orange-600 hover:underline transition-colors"
              >
                {row.original.name}
              </a>
            </Table.Cell>
            <Table.Cell class="px-4 py-3 text-right">{@render ChangeIndicator(row.original.d7)}</Table.Cell>
            <Table.Cell class="px-4 py-3 text-right">{@render ChangeIndicator(row.original.d30)}</Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
  
  {#if table.getRowModel().rows.length > 5}
    <div class="p-3 border-t border-stone-100 flex justify-center bg-stone-50/30">
        <Button
            variant="outline"
            size="sm"
            onclick={() => isExpanded = !isExpanded}
            class="text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-1 rounded-full px-4 py-1.5 shadow-sm hover:shadow h-auto"
        >
            {isExpanded ? "Show Less" : "Show More"}
            {#if isExpanded}
                <ChevronUp class="w-3 h-3" />
            {:else}
                <ChevronDown class="w-3 h-3" />
            {/if}
        </Button>
    </div>
  {/if}
</div>
