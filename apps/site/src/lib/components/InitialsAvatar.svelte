<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface Props {
    firstName: string;
    lastName: string;
    theme: "blue" | "rose";
    class?: string;
    [key: string]: any;
  }

  let { firstName, lastName, theme, class: className, ...rest }: Props = $props();

  let initials = $derived(`${firstName?.[0] || ""}${lastName?.[0] || ""}`);
</script>

<div
  class={cn(
    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-stone-100",
    theme === "blue" ? "bg-slate-100 text-slate-500" : "bg-rose-50 text-rose-500",
    className
  )}
  {...rest}
>
  {initials}
</div>
