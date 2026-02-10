<script lang="ts">
  import { Axis, Bars, Chart, Svg } from "layerchart";
  import { scaleBand } from "d3-scale";
  import { format, isSameMonth } from "date-fns";
  import SectionHeadline from "$lib/components/SectionHeadline.svelte";

  interface Props {
    data: { date: Date; distance: number }[];
  }

  let { data: chartData }: Props = $props();

  const totalDistance = $derived(
    chartData.reduce((acc, curr) => acc + curr.distance, 0)
  );

  const xAccessor = (d: (typeof chartData)[number]) => d.date;
  const yAccessor = (d: (typeof chartData)[number]) => d.distance;
  
  // Show month labels every 2 months to reduce clutter
  const formatDay = (d: Date) => {
    return d.getDate() === 1 && d.getMonth() % 2 === 0 ? format(d, "MMM") : "";
  };

  const currentMonthData = $derived(
    chartData.filter((d) =>
      isSameMonth(new Date(d.date.getTime() + 43200000), new Date())
    )
  );
  const otherMonthData = $derived(
    chartData.filter((d) =>
      !isSameMonth(new Date(d.date.getTime() + 43200000), new Date())
    )
  );
</script>

<div class="w-full">
  <SectionHeadline class="mb-4">Running Tracker (km)</SectionHeadline>
  <div class="h-[150px] w-full">
    <Chart
      data={chartData}
      x={xAccessor}
      xScale={scaleBand().padding(0.2)}
      y={yAccessor}
      yDomain={[0, null]} 
      yNice
      padding={{ top: 0, bottom: 25, left: 30, right: 0 }}
    >
      <Svg>
        <Bars
          data={otherMonthData}
          class="fill-foreground/80 hover:fill-foreground transition-colors"
          radius={1}
        />
        <Bars
          data={currentMonthData}
          fill="var(--accent)"
          class="hover:fill-foreground transition-colors"
          radius={1}
        />
        <Axis 
          placement="bottom" 
          format={formatDay} 
          classes={{ label: "text-[10px] fill-muted-foreground font-mono" }}
        />
        <Axis 
          placement="left" 
          grid
          classes={{ label: "text-[10px] fill-muted-foreground font-mono" }}
        />
      </Svg>
    </Chart>
  </div>
  <div class="text-[10px] font-mono text-muted-foreground text-right mt-2 uppercase tracking-widest">
    Year-to-Date Distance: <span class="text-foreground font-bold">{totalDistance.toFixed(1)} km</span>
  </div>
</div>
