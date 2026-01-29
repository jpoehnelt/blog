<script lang="ts">
  import { Area, Axis, Chart, Highlight, Tooltip, Spline, Svg, Points, LinearGradient, Rule, Text, Group } from "layerchart";
  import { scaleTime, scaleOrdinal, scaleLinear } from "d3-scale";
  import { format } from "date-fns";
  import { curveCatmullRom } from "d3-shape";
  import { schemeTableau10 } from "d3-scale-chromatic";

  interface RegressionData {
    trendPoints: { dayIndex: number; velocity: number }[];
    equation: string;
    r2: number;
  }

  interface ChartEvent {
    title: string;
    data: { date: string; count: number }[];
    velocityData?: { date: string; velocity: number }[];
    regression?: RegressionData | null;
  }

  interface ProcessedDataPoint {
    date: Date;
    value: number;
    label: string;
    velocity?: number;
  }

  let { events, raceDate } = $props<{ events: ChartEvent[]; raceDate?: string }>();

  const cScale = scaleOrdinal(schemeTableau10);

  let processedData = $derived.by(() => {
    return events.flatMap((event) => {
      const velMap = new Map(event.velocityData?.map((v) => [v.date, v.velocity]));
      return (event.data || []).map((d) => ({
        date: new Date(d.date),
        value: d.count,
        label: event.title,
        velocity: velMap.get(d.date),
      }));
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  let processedVelocity = $derived(
    events.flatMap((event) => {
       if (!event.velocityData) return [];
       return event.velocityData.map((d) => ({
         date: new Date(d.date),
         velocity: d.velocity,
         label: event.title,
       }));
    }).sort((a, b) => a.date.getTime() - b.date.getTime())
  );

  // Process trend line data from regression
  let trendLineData = $derived.by(() => {
    if (!events[0]?.regression?.trendPoints || events[0].regression.trendPoints.length < 2) return [];
    if (!processedVelocity.length) return [];
    
    const firstVelDate = processedVelocity[0].date.getTime();
    return events[0].regression.trendPoints.map((pt) => ({
      date: new Date(firstVelDate + pt.dayIndex * 24 * 60 * 60 * 1000),
      velocity: pt.velocity
    }));
  });

  // Calculate X Domain
  let xDomain = $derived.by(() => {
    if (processedData.length === 0) return undefined;
    const dates = processedData.map(d => d.date.getTime());
    const minDate = Math.min(...dates);
    const maxDate = raceDate ? new Date(raceDate).getTime() : Math.max(...dates);
    return [new Date(minDate), new Date(maxDate)];
  });

  // Calculate Y2 Domain (Velocity)
  let y2Domain = $derived.by(() => {
    if (processedVelocity.length === 0) return [0, 2];
    
    const vels = processedVelocity.map(d => d.velocity ?? 0);
    const current = vels[vels.length - 1];
    const min = Math.min(...vels);
    const max = Math.max(...vels);
    
    // Center around 'current'
    const maxDelta = Math.max(Math.abs(max - current), Math.abs(current - min));
    const range = maxDelta === 0 ? 0.5 : maxDelta * 1.1; // Add 10% padding
    
    return [current - range, current + range];
  });


</script>

{#snippet tooltipContent({ data })}
  <Tooltip.Header
    >{Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(data.date)}</Tooltip.Header
  >
  <Tooltip.List>
    {#if data.value !== undefined}
        <Tooltip.Item
        label="Waitlist Size"
        value={data.value}
        color="rgb(99 102 241)"
      />
    {/if}
    {#if data.velocity !== undefined}
        <Tooltip.Item
        label="Daily Position Change"
        value={data.velocity.toFixed(2)}
        color="rgb(251 113 133)"
      />
    {/if}
  </Tooltip.List>
{/snippet}

<div class="h-96 w-full p-4 mb-16 chart-wrapper">
    <!-- Legend -->
    <div class="flex items-center justify-end gap-4 mb-2">
      <div class="flex items-center gap-1.5">
        <div class="flex items-center">
          <div class="w-2 h-0.5 bg-indigo-500"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 -ml-0.5"></div>
          <div class="w-2 h-0.5 bg-indigo-500 -ml-0.5"></div>
        </div>
        <span class="text-xs font-bold text-slate-600">Waitlist Size</span>
      </div>
      {#if processedVelocity.length > 0}
        <div class="flex items-center gap-1.5">
          <div class="flex items-center">
            <div class="w-2 h-0.5 bg-rose-400"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-rose-400 -ml-0.5"></div>
            <div class="w-2 h-0.5 bg-rose-400 -ml-0.5"></div>
          </div>
          <span class="text-xs font-bold text-slate-600">Daily Position Change</span>
        </div>
      {/if}
      {#if trendLineData.length > 0}
        <div class="flex items-center gap-1.5">
          <div class="w-5 h-0 border-t-2 border-dashed border-violet-500"></div>
          <span class="text-xs font-bold text-slate-600">Trend</span>
        </div>
      {/if}
    </div>

  <Chart
    data={processedData}
    x="date"
    y="value"
    y2="velocity"
    z="label"
    xScale={scaleTime()}
    {xDomain}
    yDomain={[0, null]}
    {y2Domain}
    yNice
    y2Nice
    {cScale}
    padding={{ left: 50, bottom: 24, right: 70 }}
    tooltip={{ mode: "voronoi" }}
  >

    {#snippet children({ width, height, padding }: any)}
      {@const velScale = scaleLinear().domain(y2Domain).range([(height ?? 300) - (padding?.bottom ?? 0), padding?.top ?? 0]).nice()}
      <Svg>
        <LinearGradient id="area-gradient" class="from-indigo-500/50 to-indigo-500/0" vertical />

        <Axis 
          placement="left" 
          grid 
          rule 
          label="Applicants" 
          labelProps={{ class: "text-xs font-bold fill-indigo-600", dy: -10 }}
          tickLabelProps={{ class: "text-[10px] font-medium fill-slate-400" }}
        />
        <Axis 
          placement="right" 
          scale={velScale}
          grid={false} 
          rule 
          tickLabelProps={{ class: "text-[10px] font-medium fill-slate-400" }}
        />
        <Axis 
          placement="bottom" 
          format={(d) => format(d, "MMM d")} 
          rule 
          tickLabelProps={{ class: "text-[10px] font-medium fill-slate-400" }}
        />
        
        <Rule x={new Date(raceDate).getTime()} class="stroke-slate-300 stroke-dashed" />
        <Group x={new Date(raceDate).getTime()}>
          <Text 
            y={0}
            dy={4} 
            dx={-6}
            textAnchor="end" 
            class="text-[10px] font-semibold fill-slate-400 uppercase tracking-widest" 
            value="Race Day" 
          />
        </Group>

        <!-- Primary Line (Count) -->
        <Spline class="stroke-2 stroke-indigo-500" curve={curveCatmullRom} />

        <!-- Data Points (Count) -->
        <Points r={4} class="fill-indigo-500 stroke-white stroke-2" />

        <!-- Secondary Data (Velocity) - using SVG directly for correct y2 scale -->
        {#if processedVelocity.length > 0}
          {#each processedVelocity as d, i}
            <circle
              cx={((d.date.getTime() - (xDomain?.[0]?.getTime() ?? 0)) / ((xDomain?.[1]?.getTime() ?? 1) - (xDomain?.[0]?.getTime() ?? 0))) * ((width ?? 0) - (padding?.left ?? 0) - (padding?.right ?? 0)) + (padding?.left ?? 0)}
              cy={velScale(d.velocity)}
              r={3}
              class="fill-rose-400 stroke-white"
              style="stroke-width: 2;"
            />
          {/each}
          {#if processedVelocity.length >= 2}
            <path
              d={`M ${processedVelocity.map((d) => {
                const x = ((d.date.getTime() - (xDomain?.[0]?.getTime() ?? 0)) / ((xDomain?.[1]?.getTime() ?? 1) - (xDomain?.[0]?.getTime() ?? 0))) * ((width ?? 0) - (padding?.left ?? 0) - (padding?.right ?? 0)) + (padding?.left ?? 0);
                const y = velScale(d.velocity);
                return `${x},${y}`;
              }).join(' L ')}`}
              class="stroke-rose-400 fill-none"
              style="stroke-width: 2;"
            />
          {/if}
        {/if}

        <!-- Trend Line (Regression) -->
        {#if trendLineData.length >= 2}
          <path
            d={`M ${trendLineData.map((d) => {
              const x = ((d.date.getTime() - (xDomain?.[0]?.getTime() ?? 0)) / ((xDomain?.[1]?.getTime() ?? 1) - (xDomain?.[0]?.getTime() ?? 0))) * ((width ?? 0) - (padding?.left ?? 0) - (padding?.right ?? 0)) + (padding?.left ?? 0);
              const y = velScale(d.velocity);
              return `${x},${y}`;
            }).join(' L ')}`}
            class="stroke-violet-500 fill-none"
            style="stroke-width: 2; stroke-dasharray: 6, 4;"
          />
        {/if}

        <Highlight points lines />
      </Svg>



      <Tooltip.Root children={tooltipContent} />
    {/snippet}
  </Chart>
  
  <style>
    :global(.stroke-dashed) {
      stroke-dasharray: 4, 4;
    }
  </style>
</div>

<style>
  .chart-wrapper :global(path) {
    fill: none;
  }
</style>
