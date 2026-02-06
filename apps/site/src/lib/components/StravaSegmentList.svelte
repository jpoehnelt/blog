<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";

  interface SegmentEffort {
    id: number | string;
    name: string;
    elapsed_time: number;
    distance: number;
    average_grade?: number;
    segment: {
      id: number;
      average_grade: number;
    };
    achievements?: {
      type: string;
      rank: number;
    }[];
  }

  interface Props {
    segments?: SegmentEffort[];
  }

  let { segments = [] }: Props = $props();

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getAchievementColor(achievement: { type: string; rank: number }) {
    if (achievement.type === "kom")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (achievement.rank === 1)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (achievement.rank === 2)
      return "bg-gray-100 text-gray-800 border-gray-200";
    if (achievement.rank === 3)
      return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-secondary text-secondary-foreground";
  }

  function getAchievementLabel(achievement: { type: string; rank: number }) {
    if (achievement.type === "kom") return "👑 KOM";
    if (achievement.rank === 1) return "🥇 Personal Record";
    if (achievement.rank === 2) return "🥈 2nd Personal Record";
    if (achievement.rank === 3) return "🥉 3rd Personal Record";
    return "Personal Record";
  }
</script>

{#if segments && segments.length > 0}
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Segments</h3>
    <ul class="grid gap-2">
      {#each segments as segment}
        <li
          class="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
        >
          <div class="flex flex-col gap-1 overflow-hidden">
            <div class="flex items-center gap-2">
              <a
                href={`https://www.strava.com/segments/${segment.segment.id}`}
                class="font-medium truncate hover:underline hover:text-primary transition-colors"
                title={segment.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                {segment.name}
              </a>
              {#if segment.achievements && segment.achievements.length > 0}
                <div class="flex gap-1">
                  {#each segment.achievements as achievement}
                    <Badge
                      class={`px-1.5 py-0 text-[10px] h-5 ${getAchievementColor(achievement)}`}
                    >
                      {getAchievementLabel(achievement)}
                    </Badge>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="text-xs text-muted-foreground flex gap-3">
              <span>{((segment.distance || 0) / 1000).toFixed(2)} km</span>
              {#if segment.segment?.average_grade !== undefined}
                <span>{segment.segment.average_grade}%</span>
              {/if}
            </div>
          </div>
          <div class="text-sm font-mono font-medium whitespace-nowrap">
            {formatTime(segment.elapsed_time)}
          </div>
        </li>
      {/each}
    </ul>
  </div>
{/if}
