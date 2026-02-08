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
    width = "100%",
    height = 30,
    stroke = "var(--accent)",
    strokeWidth = 1.5,
    ...rest
  }: Props = $props();

  let min = $derived(Math.min(...points));
  let max = $derived(Math.max(...points));
  let range = $derived(max - min);

  // Reserve space for stroke to avoid clipping at top/bottom edges
  let padding = $derived(strokeWidth);
  let drawHeight = $derived((height as number) - 2 * padding);

  let pathData = $derived(
    points.length < 2
      ? ""
      : points
          .map((val, i) => {
            // x is simply the index i (0 to N-1)
            // y is scaled value
            const normalizedY = range === 0 ? 0.5 : (val - min) / range;
            const y = padding + (1 - normalizedY) * drawHeight;
            return `${i === 0 ? "M" : "L"} ${i} ${y}`;
          })
          .join(" ")
  );
</script>

{#if points.length > 1}
  <svg
    {width}
    {height}
    viewBox={`0 0 ${points.length - 1} ${height}`}
    preserveAspectRatio="none"
    class="overflow-visible"
    role="img"
    aria-label="Sparkline chart"
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
{/if}
