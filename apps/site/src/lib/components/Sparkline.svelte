<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    points: number[];
    width?: number | string;
    height?: number | string;
    stroke?: string;
    strokeWidth?: number;
    class?: string;
    [key: string]: any;
  }

  let {
    points,
    width = "100%",
    height = 30,
    stroke = "var(--accent)",
    strokeWidth = 1.5,
    class: className,
    ...rest
  }: Props = $props();

  let min = $derived(Math.min(...points));
  let max = $derived(Math.max(...points));
  let range = $derived(max - min);

  let pathData = $derived(
    points.length < 2
      ? `M 0 50 L 100 50`
      : points
          .map((val, i) => {
            const x = (i / (points.length - 1)) * 100;
            const normalizedY = range === 0 ? 0.5 : (val - min) / range;
            // In SVG, y=0 is top. We map min value to 100 (bottom) and max to 0 (top)
            const y = 100 - normalizedY * 100;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
  );
</script>

<svg
  {width}
  {height}
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
  class={cn("overflow-visible", className)}
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
</svg>
