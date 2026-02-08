<script lang="ts">
  import type { CompetitivenessStats } from "./types";

  interface Props {
    /** If provided, shows runner-count-specific stats (ranked count, excluded counts) */
    competitiveness?: CompetitivenessStats | null;
    /** Visual variant: 'compact' for inline in cards, 'card' for standalone section */
    variant?: "compact" | "card";
  }

  let { competitiveness = null, variant = "compact" }: Props = $props();
</script>

{#if variant === "card"}
  <div class="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
    <h2 class="text-lg font-bold text-slate-900 mb-3">
      About Rankings &amp; Methodology
    </h2>
    <p class="text-stone-600 leading-relaxed">
      Rankings are based on <a
        href="https://ultrasignup.com"
        target="_blank"
        rel="noopener"
        class="text-orange-600 hover:text-orange-700 font-medium">UltraSignup</a
      >
      runner rankings. Only runners with <strong>5 or more finishes</strong> are
      included to ensure meaningful rankings. An "elite" runner has a rank of 90
      or higher—approximately the top 10% of ultra runners. "Field Strength" is the
      UltraSignup rank of the 20th strongest qualified runner—a higher value indicates
      greater depth of talent.
    </p>
    <p class="text-stone-500 text-sm mt-2">
      90+ = Elite • 80-89 = Strong • 60-79 = Experienced • &lt;60 = Developing
    </p>
  </div>
{:else}
  <!-- Compact variant for inline use in cards -->
  <div
    class="mt-3 pt-2 border-t border-stone-100 text-xs text-stone-400 space-y-1"
  >
    <p>
      <strong class="text-stone-500">About rankings:</strong>
      {#if competitiveness}
        Stats based on {competitiveness.rankedEntrants} runners with 5+ UltraSignup
        finishes.
      {:else}
        Only runners with 5+ UltraSignup finishes are included.
      {/if}
    </p>
    <p class="text-stone-400/80">
      Field Strength is the UltraSignup rank of the 20th strongest qualified
      runner—a higher value indicates greater depth of talent.
    </p>
    {#if competitiveness && (competitiveness.insufficientResultsCount > 0 || competitiveness.unrankedCount > 0)}
      <p class="text-stone-400/80">
        Excluded: {competitiveness.insufficientResultsCount > 0
          ? `${competitiveness.insufficientResultsCount} with <5 finishes`
          : ""}{competitiveness.insufficientResultsCount > 0 &&
        competitiveness.unrankedCount > 0
          ? ", "
          : ""}{competitiveness.unrankedCount > 0
          ? `${competitiveness.unrankedCount} unranked`
          : ""}
      </p>
    {/if}
    <p class="text-stone-400/80">
      90+ = Elite • 80-89 = Strong • 60-79 = Experienced • &lt;60 = Developing
    </p>
  </div>
{/if}
