<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import SearchIcon from "@lucide/svelte/icons/search";
	import { Spinner } from "$lib/components/ui/spinner";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		isLoading = false,
		...restProps
	}: CommandPrimitive.InputProps & { isLoading?: boolean } = $props();
</script>

<div
	class="flex h-9 items-center gap-2 border-b pl-3 pr-8 relative"
	data-slot="command-input-wrapper"
>
	<SearchIcon class="size-4 shrink-0 opacity-50" />
	<CommandPrimitive.Input
		data-slot="command-input"
		class={cn(
			"placeholder:text-muted-foreground outline-hidden flex h-10 w-full rounded-md bg-transparent py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		bind:ref
		{...restProps}
		bind:value
	/>
	{#if isLoading}
		<div class="absolute right-3 flex items-center justify-center">
			<Spinner class="size-4 opacity-50" />
		</div>
	{/if}
</div>
