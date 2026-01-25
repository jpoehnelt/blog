<script lang="ts">
  interface Props {
    points: number[];
    width?: number | string;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    animate?: boolean;
    [key: string]: any;
  }

  let {
    points,
    width = 100,
    height = 30,
    stroke = "currentColor",
    strokeWidth = 1.5,
    animate = true,
    ...rest
  }: Props = $props();

  let min = $derived(Math.min(...points));
  let max = $derived(Math.max(...points));
  let range = $derived(max - min);

  let pathData = $derived(
    points
      .map((val, i) => {
        const x = (i / (points.length - 1)) * 100;
        const normalizedY = range === 0 ? 0.5 : (val - min) / range;
        const y = (1 - normalizedY) * (height as number);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ")
  );
</script>

<svg
  {width}
  {height}
  viewBox={`0 0 100 ${height}`}
  preserveAspectRatio="none"
  class="overflow-visible"
  {...rest}
>
  <path
    d={pathData}
    fill="none"
    {stroke}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    vector-effect="non-scaling-stroke"
  />
  {#if animate}
    <circle r={strokeWidth * 1.5} fill={stroke}>
      <animateMotion dur="5s" repeatCount="indefinite" path={pathData} />
    </circle>
  {/if}
</svg>
