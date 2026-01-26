<script lang="ts">
  // @ts-nocheck
  import { Axis, Chart, Line, Highlight, Tooltip, Spline, Area, Svg } from "layerchart";
  import { scaleTime, scaleOrdinal } from "d3-scale";
  import { format } from "date-fns";
  import { curveCatmullRom } from "d3-shape";
  import { schemeTableau10 } from "d3-scale-chromatic";

  interface ChartEvent {
      title: string;
      data: { date: string; count: number }[];
  }

  let { events } = $props<{ events: ChartEvent[] }>();
  
  const cScale = scaleOrdinal(schemeTableau10);

  let processedData = $derived(events.flatMap((event: ChartEvent) => {
      if (!event.data) return [];
      return event.data.map((d: { date: string; count: number }) => ({
          date: new Date(d.date),
          value: d.count,
          label: event.title
      }));
  }));
</script>

<div class="h-96 w-full p-4 mb-16 chart-wrapper">
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
        <!-- @ts-ignore -->
        <Tooltip.Item label={data.label} value={data.value} color={String(cScale(data.label))} />
      </Tooltip.List>
    </Tooltip.Root>
  </Chart>
</div>

<style>
  .chart-wrapper :global(path) {
    fill: none;
  }
</style>
