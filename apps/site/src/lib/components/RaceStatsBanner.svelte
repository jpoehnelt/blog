<script lang="ts">
  import ActionLink from "$lib/components/ActionLink.svelte";

  interface Props {
    totalRaces: number;
    eliteRunners: number;
    activeWaitlists: number;
  }

  let { totalRaces, eliteRunners, activeWaitlists }: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-4 px-6 border-y border-border text-sm font-mono text-muted-foreground bg-muted/30">
  <div class="flex items-center gap-2">
    <span class="text-base">🏁</span>
    <span><strong class="text-foreground">{totalRaces}</strong> races tracked</span>
  </div>
  <span class="hidden sm:inline text-border">•</span>
  <div class="flex items-center gap-2">
    <span class="text-base">⭐</span>
    <span><strong class="text-foreground">{eliteRunners.toLocaleString()}</strong> elite runners</span>
  </div>
  <span class="hidden sm:inline text-border">•</span>
  <div class="flex items-center gap-2">
    <span class="text-base">📋</span>
    <span><strong class="text-foreground">{activeWaitlists}</strong> active waitlists</span>
  </div>
  <ActionLink href="/ultras/races" variant="uppercase" class="ml-4">
    View All →
  </ActionLink>
</div>
