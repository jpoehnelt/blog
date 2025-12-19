<script lang="ts">
  import { Axis, Bars, Chart, Svg } from "layerchart";
  import { scaleBand } from "d3-scale";
  import { format, startOfDay, isAfter, isSameDay, startOfYear, differenceInDays, addDays } from "date-fns";
  import type { DetailedActivityResponse } from "strava-v3";

  interface Props {
    activities: DetailedActivityResponse[];
  }

  let { activities }: Props = $props();

  const today = startOfDay(new Date());
  const startOfYearDate = startOfYear(today);
  const daysCount = differenceInDays(today, startOfYearDate) + 1;

  // Use $derived for the chart data to ensure reactivity in Svelte 5
  const chartData = $derived.by(() => {
    // Initialize YTD days
    const days = Array.from({ length: daysCount }, (_, i) => {
      const date = addDays(startOfYearDate, i);
      return {
        date,
        distance: 0,
      };
    });

    // Populate with activity data
    activities.forEach((activity) => {
      if (!activity.start_date) return;
      const activityDate = startOfDay(new Date(activity.start_date));
      if (isAfter(activityDate, addDays(startOfYearDate, -1))) {
        const dayData = days.find((d) => isSameDay(d.date, activityDate));
        if (dayData) {
          dayData.distance += (activity.distance || 0) / 1000;
        }
      }
    });

    return days;
  });

  const totalDistance = $derived(
    chartData.reduce((acc, curr) => acc + curr.distance, 0)
  );

  const xAccessor = (d: (typeof chartData)[number]) => d.date;
  const yAccessor = (d: (typeof chartData)[number]) => d.distance;
  
  // Show month labels every 2 months to reduce clutter
  const formatDay = (d: Date) => {
    return d.getDate() === 1 && d.getMonth() % 2 === 0 ? format(d, "MMM") : "";
  };
</script>

<div class="w-full mt-4 mb-8">
  <h3 class="text-sm font-bold uppercase border-b border-foreground mb-4 pb-1">Running Tracker (km)</h3>
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
        <Bars class="fill-foreground/80 hover:fill-foreground transition-colors" radius={1} />
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
