<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    value: number;
    theme: "blue" | "rose";
    class?: string;
    [key: string]: any;
  }

  let { value, theme, class: className, ...rest }: Props = $props();
</script>

<div
  class={cn("relative h-2 w-full bg-stone-100 rounded-full overflow-hidden", className)}
  {...rest}
>
  <div
    class={cn(
      "absolute h-full rounded-full transition-all duration-500 ease-out",
      theme === "blue" ? "bg-blue-500" : "bg-rose-500"
    )}
    style="width: {value}%"
  ></div>
</div>
