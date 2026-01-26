<script lang="ts">
  import { Axis, Chart, Highlight, Tooltip, Spline, Svg } from "layerchart";
  import { scaleTime, scaleOrdinal } from "d3-scale";
  import { format } from "date-fns";
  import { schemeTableau10 } from "d3-scale-chromatic";
  import { curveCatmullRom } from "d3-shape";

  let { events } = $props<{ events: { title: string; data: { date: string; count: number; applicants: string[] }[] }[] }>();
  
  const cScale = scaleOrdinal(schemeTableau10);

  let processedData = $derived(events.flatMap(event => {
      if (!event.data || event.data.length < 2) return [];

      return event.data.map((d, i) => {
          if (i === 0) return null;
          
          const prev = event.data[i - 1];
          const currentSet = new Set(d.applicants);
          
          // Count how many from previous day are NOT in current day
          const removed = prev.applicants.filter(a => !currentSet.has(a)).length;
          
          return {
            date: new Date(d.date),
            value: removed,
            label: event.title
          };
      }).filter(Boolean) as { date: Date; value: number; label: string }[];
  }));
</script>

<div class="h-64 w-full p-4 mb-16 chart-wrapper">
  {#if processedData.length === 0}
    <div class="h-full flex items-center justify-center text-muted-foreground text-sm">
      Not enough data to calculate velocity yet.
    </div>
  {:else}
    <Chart
      data={processedData}
      x="date"
      y="value"
      z="label"
      xScale={scaleTime()}
      yDomain={[0, null]}
      yNice
      cScale={cScale}
      padding={{ left: 16, bottom: 24, right: 120 }}
      tooltip={{ mode: "voronoi" }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, "MMM d")}
          rule
        />
        <Spline class="stroke-2" curve={curveCatmullRom} />
        <Highlight points lines />
      </Svg>
      
       <div class="absolute top-2 right-2 flex flex-col gap-1 text-xs">
          {#each events as event, i}
              <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" style="background-color: {cScale(event.title)}"></div>
                  <span>{event.title}</span>
              </div>
          {/each}
      </div>

      <!-- @ts-ignore -->
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, "MMM d, yyyy")}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.label} value={data.value} color={cScale(data.label)} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  {/if}
</div>

<style>
  .chart-wrapper :global(path) {
    fill: none;
  }
</style>
