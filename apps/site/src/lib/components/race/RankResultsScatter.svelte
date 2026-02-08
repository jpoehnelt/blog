<script lang="ts">
  import { Axis, Chart, Svg, getChartContext } from "layerchart";
  import { scaleLinear } from "d3-scale";

  interface RunnerPoint {
    rank: number;
    results: number;
  }

  let { data }: { data: RunnerPoint[] } = $props();

  const xAccessor = (d: RunnerPoint) => d.results;
  const yAccessor = (d: RunnerPoint) => d.rank;

  // Filter to results <= 100 for cleaner chart
  const filteredData = $derived(
    data.filter((d) => d.results >= 1 && d.results <= 100),
  );

  const ELITE_RANK = 90;
  const MIN_RESULTS = 5;
</script>

{#snippet scatterPoints()}
  {@const { xScale, yScale, padding } = getChartContext()}
  <!-- Elite zone box (rank >= 90, results >= 5) -->
  {@const boxX = xScale(MIN_RESULTS)}
  {@const boxY = yScale(100)}
  {@const boxW = xScale(100) - xScale(MIN_RESULTS)}
  {@const boxH = yScale(ELITE_RANK) - yScale(100)}
  <rect
    x={boxX}
    y={boxY}
    width={boxW}
    height={boxH}
    class="fill-purple-100/50 stroke-purple-300"
    stroke-width="1"
    stroke-dasharray="4 3"
    rx="4"
  />

  <!-- Non-elite runners (gray) -->
  {#each filteredData as point}
    {@const isElite = point.rank >= ELITE_RANK && point.results >= MIN_RESULTS}
    {#if !isElite}
      <circle
        cx={xScale(point.results)}
        cy={yScale(point.rank)}
        r="2"
        class="fill-stone-300/40 stroke-stone-400/50"
        stroke-width="0.5"
      />
    {/if}
  {/each}

  <!-- Elite runners on top (purple) -->
  {#each filteredData as point}
    {@const isElite = point.rank >= ELITE_RANK && point.results >= MIN_RESULTS}
    {#if isElite}
      <circle
        cx={xScale(point.results)}
        cy={yScale(point.rank)}
        r="3"
        class="fill-purple-500/60 stroke-purple-700/80"
        stroke-width="0.5"
      />
    {/if}
  {/each}
{/snippet}

<div class="h-[380px] w-full text-foreground">
  <Chart
    data={filteredData}
    x={xAccessor}
    xScale={scaleLinear()}
    xDomain={[0, 100]}
    y={yAccessor}
    yScale={scaleLinear()}
    yDomain={[0, 100]}
    yNice
    padding={{ top: 16, bottom: 44, left: 48, right: 16 }}
  >
    <Svg>
      <Axis placement="bottom" label="UltraSignup Finishes" rule />
      <Axis placement="left" label="UltraSignup Rank" rule />
      {@render scatterPoints()}
    </Svg>
  </Chart>
</div>
