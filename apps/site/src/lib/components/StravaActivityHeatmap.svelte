<script lang="ts">
  import { ExternalLink } from "@lucide/svelte";

  interface YearData {
    year: number;
    data: number[];
  }

  interface Props {
    // Day-of-week frequency by year (7 items per year)
    dayOfWeekByYear: YearData[];
    // Month frequency by year (12 items per year)
    monthByYear: YearData[];
    // Hour frequency by year (24 items per year, grouped to 8)
    hourByYear: YearData[];
    // Last 12 months calendar data
    last12MonthsCalendar: { date: string; count: number; distance: number }[];
    // Stats
    stats: {
      totalWorkouts: number;
      totalDistance: number;
      totalTime: number;
      totalElevation: number;
      mostActiveDay: string;
      mostActiveDayCount: number;
      mostActiveMonth: string;
      mostActiveMonthCount: number;
      peakHour: string;
      peakHourCount: number;
    };
    currentYear: number;
  }

  let {
    dayOfWeekByYear,
    monthByYear,
    hourByYear,
    last12MonthsCalendar,
    stats,
    currentYear,
  }: Props = $props();

  // Day labels
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Month labels
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Hour labels (grouped)
  const hourLabels = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

  // Get color intensity class (0-4)
  function getIntensityClass(count: number, max: number): string {
    if (count === 0) return "intensity-0";
    const ratio = count / max;
    if (ratio <= 0.25) return "intensity-1";
    if (ratio <= 0.5) return "intensity-2";
    if (ratio <= 0.75) return "intensity-3";
    return "intensity-4";
  }

  // Get max value from YearData array
  function getMaxFromYearData(data: YearData[]): number {
    let max = 0;
    for (const year of data) {
      for (const val of year.data) {
        if (val > max) max = val;
      }
    }
    return max || 1;
  }

  // Generate weeks for last 12 months calendar
  function generateLast12MonthsWeeks() {
    const weeks: { date: string; count: number }[][] = [];
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Create a map for quick lookup
    const dataMap = new Map<string, number>();
    for (const item of last12MonthsCalendar) {
      dataMap.set(item.date, item.count);
    }

    // Find the first Sunday on or before 12 months ago
    let current = new Date(twelveMonthsAgo);
    current.setDate(current.getDate() - current.getDay());

    while (current <= today) {
      const week: { date: string; count: number }[] = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = current.toISOString().split("T")[0];
        const isInRange = current >= twelveMonthsAgo && current <= today;
        week.push({
          date: dateStr,
          count: isInRange ? dataMap.get(dateStr) || 0 : -1,
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  }

  const calendarWeeks = $derived(generateLast12MonthsWeeks());
  const calendarMax = $derived(
    Math.max(...last12MonthsCalendar.map((d) => d.count), 1),
  );
  const dowMax = $derived(getMaxFromYearData(dayOfWeekByYear));
  const monthMax = $derived(getMaxFromYearData(monthByYear));
  const hourMax = $derived(getMaxFromYearData(hourByYear));

  // Format time in h:mm format
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Format distance
  function formatDistance(meters: number): string {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  }

  // Format elevation
  function formatElevation(meters: number): string {
    const feet = meters * 3.28084;
    return `${feet.toLocaleString(undefined, { maximumFractionDigits: 0 })} ft`;
  }

  // Get month positions for a calendar year
  function getMonthPositions(weeks: { date: string; count: number }[][]) {
    const positions: { label: string; week: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      for (const day of week) {
        if (day.count >= 0) {
          const date = new Date(day.date);
          const month = date.getMonth();
          if (month !== lastMonth) {
            positions.push({ label: monthLabels[month], week: weekIndex });
            lastMonth = month;
          }
          break;
        }
      }
    });

    return positions;
  }
</script>

<section class="strava-heatmap" id="workout-frequency">
  <h2
    class="text-xl font-bold uppercase border-b-2 border-foreground pb-1 mb-6 tracking-wider"
  >
    Workout Frequency
  </h2>

  <div class="heatmap-container">
    <div class="heatmap-row">
      <!-- Day of Week by Year -->
      <div class="heatmap-panel">
        <div class="heatmap-labels-top">
          {#each dayLabels.filter((_, i) => i % 2 === 0) as label}
            <span>{label}</span>
          {/each}
        </div>
        <div class="heatmap-grid-wrapper">
          <div class="heatmap-labels-left">
            {#each dayOfWeekByYear as yearData}
              <span>{yearData.year}</span>
            {/each}
          </div>
          <div class="heatmap-grid dow-grid">
            {#each dayOfWeekByYear as yearData}
              <div class="heatmap-row-cells">
                {#each yearData.data as count}
                  <div
                    class="heatmap-cell {getIntensityClass(count, dowMax)}"
                    title="{count} workouts"
                  ></div>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Month by Year -->
      <div class="heatmap-panel">
        <div class="heatmap-labels-top month-labels">
          {#each monthLabels.filter((_, i) => i % 2 === 0) as label}
            <span>{label}</span>
          {/each}
        </div>
        <div class="heatmap-grid-wrapper">
          <div class="heatmap-labels-left">
            {#each monthByYear as yearData}
              <span>{yearData.year}</span>
            {/each}
          </div>
          <div class="heatmap-grid month-grid">
            {#each monthByYear as yearData}
              <div class="heatmap-row-cells">
                {#each yearData.data as count}
                  <div
                    class="heatmap-cell {getIntensityClass(count, monthMax)}"
                    title="{count} workouts"
                  ></div>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Hour by Year -->
      <div class="heatmap-panel">
        <div class="heatmap-labels-top hour-labels">
          {#each hourLabels as label}
            <span>{label}</span>
          {/each}
        </div>
        <div class="heatmap-grid-wrapper">
          <div class="heatmap-labels-left">
            {#each hourByYear as yearData}
              <span>{yearData.year}</span>
            {/each}
          </div>
          <div class="heatmap-grid hour-grid">
            {#each hourByYear as yearData}
              <div class="heatmap-row-cells">
                {#each yearData.data as count}
                  <div
                    class="heatmap-cell {getIntensityClass(count, hourMax)}"
                    title="{count} workouts"
                  ></div>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Last 12 Months Calendar -->
    <div class="calendar-section">
      <div class="calendar-wrapper">
        <div class="calendar-labels-left">
          {#each dayLabels.filter((_, i) => i % 2 === 0) as label}
            <span>{label}</span>
          {/each}
        </div>
        <div class="calendar-content">
          <div class="calendar-months">
            {#each getMonthPositions(calendarWeeks) as pos}
              <span style="grid-column: {pos.week + 1}">{pos.label}</span>
            {/each}
          </div>
          <div class="calendar-grid">
            {#each calendarWeeks as week}
              <div class="calendar-week">
                {#each week as day}
                  {#if day.count >= 0}
                    <div
                      class="heatmap-cell {getIntensityClass(
                        day.count,
                        calendarMax,
                      )}"
                      title="{day.date}: {day.count} workouts"
                    ></div>
                  {:else}
                    <div class="heatmap-cell empty"></div>
                  {/if}
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="strava-link">
    <a
      href="https://www.strava.com/athletes/2170160"
      target="_blank"
      rel="noopener noreferrer"
      class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
    >
      View on Strava <ExternalLink size={10} />
    </a>
  </div>
</section>

<style>
  .strava-heatmap {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    padding: 1rem;
    background: hsl(var(--muted) / 0.3);
    border-radius: 0.5rem;
    border: 1px solid hsl(var(--border));
  }

  .heatmap-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .heatmap-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    overflow: hidden;
  }

  .heatmap-panel {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
    min-width: 0;
  }

  .heatmap-labels-top {
    display: flex;
    justify-content: space-between;
    font-size: 0.625rem;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-mono, monospace);
    padding-left: 2rem;
  }

  .heatmap-grid-wrapper {
    display: flex;
    gap: 0.25rem;
    overflow: hidden;
  }

  .heatmap-labels-left {
    display: grid;
    grid-auto-rows: 12px;
    gap: 2px;
    font-size: 0.625rem;
    color: var(--muted-foreground);
    font-family: var(--font-mono, monospace);
    text-align: right;
    min-width: 2rem;
    align-items: center;
  }

  .heatmap-labels-left span {
    line-height: 12px;
  }

  .heatmap-grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .heatmap-row-cells {
    display: flex;
    gap: 2px;
  }

  .heatmap-cell {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    flex-shrink: 1;
  }

  .dow-grid .heatmap-cell {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .month-grid .heatmap-cell {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .hour-grid .heatmap-cell {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  /* Intensity colors - orange theme using site accent color */
  .intensity-0 {
    background: var(--muted);
  }
  .intensity-1 {
    background: oklch(0.45 0.12 50);
  }
  .intensity-2 {
    background: oklch(0.55 0.16 50);
  }
  .intensity-3 {
    background: oklch(0.65 0.2 50);
  }
  .intensity-4 {
    background: var(--accent);
  }

  .heatmap-cell.empty {
    background: transparent;
  }

  /* Calendar Section */
  .calendar-section {
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }

  .calendar-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .calendar-labels-left {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    gap: 2px;
    font-size: 0.625rem;
    color: var(--muted-foreground);
    font-family: var(--font-mono, monospace);
    text-align: right;
    min-width: 1.5rem;
    height: calc(7 * 12px + 6 * 2px);
    align-items: center;
    margin-top: 18px;
  }

  .calendar-labels-left span {
    line-height: 1;
  }

  .calendar-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .calendar-months {
    display: grid;
    grid-template-columns: repeat(53, minmax(0, 1fr));
    font-size: 0.625rem;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-mono, monospace);
    margin-bottom: 0.25rem;
    height: 14px;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(53, minmax(0, 1fr));
    gap: 2px;
  }

  .calendar-week {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .calendar-week .heatmap-cell {
    width: auto;
    aspect-ratio: 1;
    flex-shrink: 1;
  }

  .calendar-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    min-width: 200px;
  }

  .strava-link {
    margin-top: 0.75rem;
    text-align: right;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .heatmap-row {
      grid-template-columns: 1fr;
    }

    .calendar-wrapper {
      flex-direction: column;
    }

    .calendar-stats {
      width: 100%;
    }

    .calendar-labels-left {
      display: none;
    }
  }
</style>
