<script lang="ts">
  interface Props {
    points: number[];
    width?: number | string;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    animate?: boolean;
    referenceValue?: number;
    [key: string]: any;
  }

  let {
    points,
    width = 100,
    height = 30,
    stroke = "var(--accent)",
    strokeWidth = 1.5,
    animate = true,
    referenceValue = 0,
    ...rest
  }: Props = $props();

  let svgWidth = $state(0);
  let renderWidth = $derived(svgWidth || 100);

  let min = $derived(Math.min(...points));
  let max = $derived(Math.max(...points));
  let range = $derived(Math.max(max - min, referenceValue));

  let padding = $derived(strokeWidth);
  let drawHeight = $derived((height as number) - 2 * padding);

  let pathData = $derived(
    points
      .map((val, i) => {
        const x = (i / (points.length - 1)) * renderWidth;
        const normalizedY = range === 0 ? 0.5 : (val - min) / range;
        const y = padding + (1 - normalizedY) * drawHeight;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ")
  );
</script>

<svg
  {width}
  {height}
  viewBox={`0 0 ${renderWidth} ${height}`}
  preserveAspectRatio="none"
  class="overflow-visible"
  bind:clientWidth={svgWidth}
  {...rest}
>
  <path
    d={pathData}
    fill="none"
    {stroke}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  {#if animate}
    <circle r={2} fill={stroke}>
      <animateMotion dur="10s" repeatCount="indefinite" path={pathData} />
    </circle>
  {/if}
</svg>
