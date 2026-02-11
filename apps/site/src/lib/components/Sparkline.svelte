<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    points: number[];
    width?: number | string;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    class?: string;
    [key: string]: any;
  }

  let {
    points,
    width = 100,
    height = 30,
    stroke = "var(--accent)",
    strokeWidth = 1.5,
    class: className,
    ...rest
  }: Props = $props();

  let min = $derived(Math.min(...points));
  let max = $derived(Math.max(...points));
  let range = $derived(max - min);

  let padding = $derived(strokeWidth);
  let drawHeight = $derived((height as number) - 2 * padding);

  let pathData = $derived(
    points
      .map((val, i) => {
        const x = i;
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
  viewBox={`0 0 ${points.length - 1} ${height}`}
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
