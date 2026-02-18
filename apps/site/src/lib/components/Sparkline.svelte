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

  const VIEWBOX_WIDTH = 100;
  const VIEWBOX_HEIGHT = 100;

  let min = $derived(Math.min(...points));
  let max = $derived(Math.max(...points));
  let range = $derived(max - min);

  let pathData = $derived(
    points
      .map((val, i) => {
        const x = (i / (points.length - 1)) * VIEWBOX_WIDTH;
        const normalizedY = range === 0 ? 0.5 : (val - min) / range;
        // Invert Y because SVG coordinates go down (0 is top)
        // Map value (0..1) to y (100..0)
        const y = VIEWBOX_HEIGHT - normalizedY * VIEWBOX_HEIGHT;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ")
  );
</script>

<svg
  {width}
  {height}
  viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
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
