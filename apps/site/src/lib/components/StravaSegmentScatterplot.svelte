<script lang="ts">
  import { Axis, Chart, Points, Svg } from "layerchart";
  import { scaleLinear } from "d3-scale";

  interface DataPoint {
    elapsed_time: number;
    average_heartrate: number;
    start_date: string | Date;
    id: number | string;
  }

  let { data }: { data: DataPoint[] } = $props();

  const xAccessor = (d: DataPoint) => d.elapsed_time;
  const yAccessor = (d: DataPoint) => d.average_heartrate;

  // Sort data by elapsed time
  const sortedData = $derived(
    data.sort((a, b) => a.elapsed_time - b.elapsed_time)
  );

  // Filter out data points that are more than 3x slower than the fastest
  const filteredData = $derived(
    sortedData.filter((d) => d.elapsed_time / sortedData[0].elapsed_time < 3)
  );

  // Format elapsed time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
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
      <Axis placement="bottom" format={formatTime} rule />
      <Axis placement="left" rule />
      <Points r={4} class="stroke-background stroke-2" />
    </Svg>
  </Chart>
</div>
