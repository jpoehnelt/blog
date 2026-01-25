<script lang="ts">
  interface Props {
    points: number[];
    width?: number | string;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    [key: string]: any;
  }

  let {
    points,
    width = 100,
    height = 30,
    stroke = "currentColor",
    strokeWidth = 1.5,
    ...rest
  }: Props = $props();

  let min = $derived(Math.min(...points));
  let max = $derived(Math.max(...points));
  let range = $derived(max - min);

  let polylinePoints = $derived(
    points
      .map((val, i) => {
        const x = (i / (points.length - 1)) * 100;
        const normalizedY = range === 0 ? 0.5 : (val - min) / range;
        const y = (1 - normalizedY) * (height as number);
        return `${x},${y}`;
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
  <polyline
    points={polylinePoints}
    fill="none"
    {stroke}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    vector-effect="non-scaling-stroke"
  />
</svg>
