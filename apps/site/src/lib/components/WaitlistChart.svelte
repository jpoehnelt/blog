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
    velocityData: { date: string; velocity: number }[];
    frontSeries: { date: string; velocity: number }[];
    medianSeries: { date: string; velocity: number }[];
    regression?: RegressionData | null;
    waitlistProjection?: WaitlistProjection | null;
  }

  interface ProcessedDataPoint {
    date: Date;
    value: number;
    label: string;
    velocity?: number; // Keep for legacy/tooltip compatibility if needed
    frontVelocity?: number;
    medianVelocity?: number;
  }

  interface VelocityPoint {
    date: Date;
    velocity: number;
    label: string;
    type: 'avg' | 'front' | 'median';
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

  // Legend State
  let visibleSeries = $state({
    count: true,
    front: true,
    median: true,
    trend: true
  });

  const toggleSeries = (key: keyof typeof visibleSeries) => {
    visibleSeries[key] = !visibleSeries[key];
  };

  let processedData = $derived.by((): ProcessedDataPoint[] => {
    if (!visibleSeries.count) return [];
    return events.flatMap((event: ChartEvent) => {
      // ... logic remains same ...
      const frontMap = new Map(event.frontSeries?.map((v) => [v.date, v.velocity]));
      const medianMap = new Map(event.medianSeries?.map((v) => [v.date, v.velocity]));
      
      return (event.data || []).map((d: { date: string; count: number }) => ({
        date: new Date(d.date),
        value: d.count,
        label: event.title,
        frontVelocity: frontMap.get(d.date),
        medianVelocity: medianMap.get(d.date),
      }));
    }).sort((a: ProcessedDataPoint, b: ProcessedDataPoint) => a.date.getTime() - b.date.getTime());
  });

  let processedVelocities = $derived.by((): VelocityPoint[] => {
      const points: VelocityPoint[] = [];
      events.forEach((event: ChartEvent) => {
          if (event.frontSeries) {
              event.frontSeries.forEach((d: { date: string; velocity: number }) => {
                  points.push({ date: new Date(d.date), velocity: d.velocity, label: event.title, type: 'front' });
              });
          }
          if (event.medianSeries) {
              event.medianSeries.forEach((d: { date: string; velocity: number }) => {
                  points.push({ date: new Date(d.date), velocity: d.velocity, label: event.title, type: 'median' });
              });
          }
      });
      return points.sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  let frontSeriesData = $derived(
    visibleSeries.front 
      ? processedVelocities.filter((d: VelocityPoint) => d.type === 'front')
      : []
  );
  let medianSeriesData = $derived(
    visibleSeries.median
      ? processedVelocities.filter((d: VelocityPoint) => d.type === 'median')
      : []
  );

  let trendLineData: TrendPoint[] = $derived.by((): TrendPoint[] => {
    if (!visibleSeries.trend) return [];
    
    if (!events[0]?.regression?.trendPoints || events[0].regression.trendPoints.length < 2) return [];
    if (!processedVelocities.length && !events[0].velocityData?.length) return [];
    
    const firstVelDateStr = events[0].velocityData?.[0]?.date || processedVelocities[0]?.date.toISOString();
    if (!firstVelDateStr) return [];

    const firstVelDate = new Date(firstVelDateStr).getTime();
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
    if (processedVelocities.length === 0) return [0, 10];
    
    const vels = processedVelocities.map((d: VelocityPoint) => d.velocity ?? 0);
    const max = Math.max(...vels, 10); // At least 10
    
    // Min is always 0, max with some padding
    return [0, max * 1.1];
  });
</script>

{#snippet tooltipContent({ data }: { data: ProcessedDataPoint })}
  <Tooltip.Header
    >{Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(data.date)}</Tooltip.Header
  >
  <Tooltip.List>
    {#if data.value !== undefined}
        <Tooltip.Item
        label="Waitlist Size"
        value={data.value}
        color="rgb(99 102 241)"
      />
    {/if}
    {#if data.frontVelocity !== undefined}
        <Tooltip.Item
        label="Front Velocity"
        value={data.frontVelocity.toFixed(2)}
        color="rgb(16 185 129)"
      />
    {/if}
    {#if data.medianVelocity !== undefined}
        <Tooltip.Item
        label="Median Velocity"
        value={data.medianVelocity.toFixed(2)}
        color="rgb(245 158 11)"
      />
    {/if}
  </Tooltip.List>
{/snippet}

<div class="h-96 w-full p-4 mb-16 chart-wrapper">
    <!-- Legend -->
    <div class="flex items-center justify-end gap-4 mb-2">
      <button 
        class="flex items-center gap-1.5 transition-opacity hover:opacity-80 {visibleSeries.count ? 'opacity-100' : 'opacity-40 grayscale'}"
        onclick={() => toggleSeries('count')}
      >
        <div class="flex items-center">
          <div class="w-2 h-0.5 bg-indigo-500"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 -ml-0.5"></div>
          <div class="w-2 h-0.5 bg-indigo-500 -ml-0.5"></div>
        </div>
        <span class="text-xs font-bold text-slate-600">Waitlist Size</span>
      </button>
      
      {#if processedVelocities.some(d => d.type === 'front')}
        <button 
          class="flex items-center gap-1.5 transition-opacity hover:opacity-80 {visibleSeries.front ? 'opacity-100' : 'opacity-40 grayscale'}"
          onclick={() => toggleSeries('front')}
        >
            <div class="flex items-center">
              <div class="w-2 h-0.5 bg-emerald-500"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-0.5"></div>
              <div class="w-2 h-0.5 bg-emerald-500 -ml-0.5"></div>
            </div>
            <span class="text-xs font-bold text-slate-600">Waitlist Top</span>
        </button>
      {/if}

      {#if processedVelocities.some(d => d.type === 'median')}
        <button 
          class="flex items-center gap-1.5 transition-opacity hover:opacity-80 {visibleSeries.median ? 'opacity-100' : 'opacity-40 grayscale'}"
          onclick={() => toggleSeries('median')}
        >
          <div class="flex items-center">
            <div class="w-2 h-0.5 bg-amber-500"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-amber-500 -ml-0.5"></div>
            <div class="w-2 h-0.5 bg-amber-500 -ml-0.5"></div>
          </div>
          <span class="text-xs font-bold text-slate-600">Waitlist Middle</span>
        </button>
      {/if}

      {#if events[0]?.regression?.trendPoints}
        <button 
          class="flex items-center gap-1.5 transition-opacity hover:opacity-80 {visibleSeries.trend ? 'opacity-100' : 'opacity-40 grayscale'}"
          onclick={() => toggleSeries('trend')}
        >
          <div class="w-5 h-0 border-t-2 border-dashed border-violet-500"></div>
          <span class="text-xs font-bold text-slate-600">Trend</span>
        </button>
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
          label="Waitlist Size" 
          labelProps={{ class: "text-xs font-bold fill-indigo-600", dy: -10 }}
          tickLabelProps={{ class: "text-[10px] font-medium fill-slate-500" }}
        />
        <Axis 
          placement="right" 
          scale={velScale}
          grid={false} 
          rule 
          label="Movement Speed"
          labelProps={{ class: "text-xs font-bold fill-slate-500", dy: -10 }}
          tickLabelProps={{ class: "text-[10px] font-medium fill-slate-500" }}
        />
        <Axis 
          placement="bottom" 
          format={(d) => format(d, "MMM d")} 
          rule 
          tickLabelProps={{ class: "text-[10px] font-medium fill-slate-500" }}
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

        <!-- Front Velocity (Emerald) -->
        {#if frontSeriesData.length >= 2}
            {@const frontLine = line<VelocityPoint>()
              .x(d => xScale(d.date))
              .y(d => velScale(d.velocity))
              .curve(curveCatmullRom)}
            <path
              d={frontLine(frontSeriesData) ?? ''}
              class="stroke-emerald-500 fill-none stroke-2"
            />
            {#each frontSeriesData as d}
              <circle 
                cx={xScale(d.date)} 
                cy={velScale(d.velocity)} 
                r={4} 
                class="fill-emerald-500" 
              />
            {/each}
        {/if}

        <!-- Median Velocity (Amber) -->
        {#if medianSeriesData.length >= 2}
            {@const medianLine = line<VelocityPoint>()
              .x(d => xScale(d.date))
              .y(d => velScale(d.velocity))
              .curve(curveCatmullRom)}
            <path
              d={medianLine(medianSeriesData) ?? ''}
              class="stroke-amber-500 fill-none stroke-2"
            />
            {#each medianSeriesData as d}
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
  {#if processedVelocities.length > 0}
    <div class="text-xs text-slate-500 mt-2 space-y-1">
        <p><span class="text-emerald-600 font-bold">Waitlist Top:</span> Movement speed of the applicant currently at position #1.</p>
        <p><span class="text-amber-600 font-bold">Waitlist Middle:</span> Movement speed of applicants in the middle of the pack.</p>
    </div>
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
