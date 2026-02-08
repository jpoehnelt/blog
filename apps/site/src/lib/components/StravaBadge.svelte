<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { cn } from "$lib/utils.js";

  interface Achievement {
    type: string;
    rank: number;
  }

  interface Props {
    achievement: Achievement;
    class?: string;
    [key: string]: any;
  }

  let { achievement, class: className, ...rest }: Props = $props();

  let color = $derived.by(() => {
    if (achievement.type === "kom") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (achievement.rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (achievement.rank === 2) return "bg-gray-100 text-gray-800 border-gray-200";
    if (achievement.rank === 3) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-secondary text-secondary-foreground";
  });

  let label = $derived.by(() => {
    if (achievement.type === "kom") return "👑 KOM";
    if (achievement.rank === 1) return "🥇 Personal Record";
    if (achievement.rank === 2) return "🥈 2nd Personal Record";
    if (achievement.rank === 3) return "🥉 3rd Personal Record";
    return "Personal Record";
  });
</script>

<Badge class={cn("px-1.5 py-0 text-[10px] h-5", color, className)} {...rest}>
  {label}
</Badge>
