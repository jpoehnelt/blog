<script lang="ts">
  import { Axis, Chart, Points, Svg } from "layerchart";
  import { scaleLinear } from "d3-scale";
  import { formatDuration } from "$lib/utils.js";

  interface DataPoint {
    elapsed_time: number;
    average_heartrate: number;
    start_date: string | Date;
    id: number | string;
  }

  let { data }: { data: DataPoint[] } = $props();

  const xAccessor = (d: DataPoint) => d.elapsed_time;
  const yAccessor = (d: DataPoint) => d.average_heartrate;

  // Optimization: Find minimum elapsed time in O(N) without sorting/mutating
  const minElapsedTime = $derived(
    data.reduce((min, d) => (d.elapsed_time < min ? d.elapsed_time : min), Infinity)
  );

  // Filter out data points that are more than 3x slower than the fastest
  const filteredData = $derived(
    data.filter((d) => d.elapsed_time / minElapsedTime < 3)
  );

</script>

<div class="h-[300px] w-full p-4 text-foreground">
  <Chart
    data={filteredData}
    x={xAccessor}
    xScale={scaleLinear()}
    y={yAccessor}
    yDomain={[0, 200]}
    yNice
    padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
  >
    <Svg>
      <Axis placement="bottom" format={formatDuration} rule />
      <Axis placement="left" rule />
      <Points r={4} class="fill-foreground stroke-background stroke-2" />
    </Svg>
  </Chart>
</div>
