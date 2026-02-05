<script lang="ts">
  import { Area, Axis, Chart, Highlight, Tooltip, Spline, Svg, Points, LinearGradient, Rule, Text, Group } from "layerchart";
  import { scaleTime, scaleOrdinal, scaleLinear } from "d3-scale";
  import { format } from "date-fns";
  import { curveCatmullRom, line } from "d3-shape";
  import { schemeTableau10 } from "d3-scale-chromatic";

  interface RegressionData {
    trendPoints: { dayIndex: number; velocity: number }[];
    equation: string;
    r2: number;
  }

  interface WaitlistProjection {
    projectedCount: number;
    trendPoints: { date: string; count: number }[];
    r2: number;
  }

  interface ChartEvent {
    title: string;
    data: { date: string; count: number }[];
    velocityData?: { date: string; velocity: number }[];
    regression?: RegressionData | null;
    waitlistProjection?: WaitlistProjection | null;
  }

  interface ProcessedDataPoint {
    date: Date;
    value: number;
    label: string;
    velocity?: number;
  }

  interface VelocityPoint {
    date: Date;
    velocity: number;
    label: string;
  }

  interface TrendPoint {
    date: Date;
    velocity: number;
  }

  interface ProjectionPoint {
    date: Date;
    count: number;
  }

  let { events, raceDate } = $props<{ events: ChartEvent[]; raceDate?: string }>();

  const cScale = scaleOrdinal(schemeTableau10);

  let processedData = $derived.by((): ProcessedDataPoint[] => {
    return events.flatMap((event: ChartEvent) => {
      const velMap = new Map(event.velocityData?.map((v: { date: string; velocity: number }) => [v.date, v.velocity]));
      return (event.data || []).map((d: { date: string; count: number }) => ({
        date: new Date(d.date),
        value: d.count,
        label: event.title,
        velocity: velMap.get(d.date),
      }));
    }).sort((a: ProcessedDataPoint, b: ProcessedDataPoint) => a.date.getTime() - b.date.getTime());
  });

  let projectionData: ProjectionPoint[] = $derived.by((): ProjectionPoint[] => {
    const event = events[0]; // Assuming single event for now as per current usage
    if (!event?.waitlistProjection?.trendPoints) return [];
    
    return event.waitlistProjection.trendPoints.map((p: { date: string; count: number }) => ({
      date: new Date(p.date),
      count: p.count
    }));
  });

  let processedVelocity: VelocityPoint[] = $derived(
    events.flatMap((event: ChartEvent) => {
       if (!event.velocityData) return [];
       return event.velocityData.map((d: { date: string; velocity: number }) => ({
         date: new Date(d.date),
         velocity: d.velocity,
         label: event.title,
       }));
    }).sort((a: VelocityPoint, b: VelocityPoint) => a.date.getTime() - b.date.getTime())
  );

  // Process trend line data from regression
  let trendLineData: TrendPoint[] = $derived.by((): TrendPoint[] => {
    if (!events[0]?.regression?.trendPoints || events[0].regression.trendPoints.length < 2) return [];
    if (!processedVelocity.length) return [];
    
    const firstVelDate = processedVelocity[0].date.getTime();
    return events[0].regression.trendPoints.map((pt: { dayIndex: number; velocity: number }) => ({
      date: new Date(firstVelDate + pt.dayIndex * 24 * 60 * 60 * 1000),
      velocity: pt.velocity
    }));
  });

  // Calculate X Domain
  let xDomain = $derived.by((): [Date, Date] | undefined => {
    if (processedData.length === 0) return undefined;
    const dates = processedData.map((d: ProcessedDataPoint) => d.date.getTime());
    const minDate = Math.min(...dates);
    const maxDate = raceDate ? new Date(raceDate).getTime() : Math.max(...dates);
    return [new Date(minDate), new Date(maxDate)];
  });

  // Calculate Y2 Domain (Velocity) - min is always 0, max is at least 10
  let y2Domain: [number, number] = $derived.by((): [number, number] => {
    if (processedVelocity.length === 0) return [0, 10];
    
    const vels = processedVelocity.map((d: VelocityPoint) => d.velocity ?? 0);
    const max = Math.max(...vels, 10); // At least 10
    
    // Min is always 0, max with some padding
    return [0, max * 1.1];
  });


</script>

{#snippet tooltipContent({ data }: { data: ProcessedDataPoint })}
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
        color="rgb(245 158 11)"
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
            <div class="w-2 h-0.5 bg-amber-500"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-amber-500 -ml-0.5"></div>
            <div class="w-2 h-0.5 bg-amber-500 -ml-0.5"></div>
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
    z="label"
    xScale={scaleTime()}
    {xDomain}
    yDomain={[0, null]}
    yNice
    {cScale}
    padding={{ left: 50, bottom: 24, right: 70 }}
    tooltip={{ mode: "voronoi" }}
  >

    {#snippet children({ context }: any)}
      {@const { width, height, padding, xScale } = context}
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
        <Points r={4} class="fill-indigo-500" />

        <!-- Secondary Data (Velocity) - using SVG directly for correct y2 scale -->
        {#if processedVelocity.length > 0}
          {#if processedVelocity.length >= 2}
            {@const velocityLine = line<VelocityPoint>()
              .x(d => xScale(d.date))
              .y(d => velScale(d.velocity))
              .curve(curveCatmullRom)}
            <path
              d={velocityLine(processedVelocity) ?? ''}
              class="stroke-amber-500 fill-none stroke-2"
            />
          {/if}
          {#each processedVelocity as d, i}
            <circle
              cx={xScale(d.date)}
              cy={velScale(d.velocity)}
              r={4}
              class="fill-amber-500"
            />
          {/each}
        {/if}

        <!-- Trend Line (Regression) -->
        {#if trendLineData.length >= 2}
          <path
            d={`M ${trendLineData.map((d: TrendPoint) => {
              const x = xScale(d.date);
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

  <!-- Subtitle/Explanation -->
  {#if processedVelocity.length > 0}
    <p class="text-xs text-slate-500 mt-2">Daily Position Change shows the average number of positions applicants move up per day.</p>
  {/if}
  
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
