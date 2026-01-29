<script lang="ts">
  import WaitlistChart from "$lib/components/WaitlistChart.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import * as Tabs from "$lib/components/ui/tabs";
  import { linearRegression, linearRegressionLine, rSquared } from "simple-statistics";

  import type {
    Race,
    WaitlistSnapshot,
    Participant,
    RaceEventSummary,
    WaitlistHistory,
  } from "@jpoehnelt/ultrasignup-scraper";

  interface PageEvent extends Omit<RaceEventSummary, "entrants"> {
    data: WaitlistHistory | null;
    entrants: Participant[] | null;
  }

  let { data } = $props<{ data: { race: Race; events: PageEvent[] } }>();

  let race = $derived(data.race);
  let events = $derived(data.events || []);

  // ... existing code ...

  const THEME = {
    primary: "text-orange-700",
    bgPrimary: "bg-orange-700",
    secondary: "text-slate-600",
    bgSecondary: "bg-slate-600",
    accent: "text-stone-500",
    bgAccent: "bg-stone-100",
  };

  interface CompetitivenessStats {
    totalEntrants: number;
    rankedEntrants: number;
    averageRank: number;
    medianRank: number;
    eliteCount: number;      // 90+ rank
    strongCount: number;     // 80-89.9 rank
    midPackCount: number;    // 60-79.9 rank
    newcomerCount: number;   // <60 or no rank
    topRunners: { name: string; rank: number; location: string }[];
    rankDistribution: { label: string; count: number; percent: number }[];
  }

  function calculateCompetitiveness(entrants: Participant[] | null): CompetitivenessStats | null {
    if (!entrants || entrants.length === 0) return null;

    const rankedEntrants = entrants.filter(e => e.rank && e.rank > 0);
    const ranks = rankedEntrants.map(e => e.rank!).sort((a, b) => b - a);
    
    if (ranks.length === 0) return null;

    const eliteCount = ranks.filter(r => r >= 90).length;
    const strongCount = ranks.filter(r => r >= 80 && r < 90).length;
    const midPackCount = ranks.filter(r => r >= 60 && r < 80).length;
    const newcomerCount = ranks.filter(r => r > 0 && r < 60).length;  // Only ranked but <60
    const unrankedCount = entrants.length - rankedEntrants.length;    // Rank 0 or missing

    const sum = ranks.reduce((a, b) => a + b, 0);
    const averageRank = sum / ranks.length;
    const medianRank = ranks[Math.floor(ranks.length / 2)];

    // Get top 10 runners
    const topRunners = rankedEntrants
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .slice(0, 10)
      .map(e => ({
        name: `${e.firstName} ${e.lastName}`,
        rank: e.rank || 0,
        location: e.location || ''
      }));

    // Create distribution buckets (based on ranked entrants only for percentages)
    const rankedTotal = rankedEntrants.length;
    const rankDistribution = [
      { label: '90+', count: eliteCount, percent: rankedTotal > 0 ? (eliteCount / rankedTotal) * 100 : 0 },
      { label: '80-89', count: strongCount, percent: rankedTotal > 0 ? (strongCount / rankedTotal) * 100 : 0 },
      { label: '60-79', count: midPackCount, percent: rankedTotal > 0 ? (midPackCount / rankedTotal) * 100 : 0 },
      { label: '<60', count: newcomerCount + unrankedCount, percent: rankedTotal > 0 ? ((newcomerCount + unrankedCount) / entrants.length) * 100 : 0 },
    ];

    return {
      totalEntrants: entrants.length,
      rankedEntrants: rankedEntrants.length,
      averageRank,
      medianRank,
      eliteCount,
      strongCount,
      midPackCount,
      newcomerCount,
      topRunners,
      rankDistribution
    };
  }

  // Filter out events with 0 runners on the waitlist
  let activeEventsBase = $derived(
    events.filter((e: PageEvent) => {
      if (!e.data || e.data.length === 0) return false;
      const lastPoint = e.data[e.data.length - 1];
      return (lastPoint?.count || 0) > 0;
    }),
  );

  interface PercentileStats {
    percentile: number;
    position: number;
    velocity: number; // positions moved per day at this percentile
  }

  function calculatePercentileVelocities(event: PageEvent): PercentileStats[] {
    if (!event.data || event.data.length < 2) return [];

    const sortedData = [...event.data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get the two most recent snapshots with applicant data
    const recent = sortedData.filter(d => d.applicants && d.applicants.length > 0);
    if (recent.length < 2) return [];
    
    const prev = recent[recent.length - 2];
    const curr = recent[recent.length - 1];
    
    if (!prev.applicants || !curr.applicants) return [];
    
    const days = (new Date(curr.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 0) return [];
    
    const totalCount = curr.count;
    const percentiles = [50, 75, 90, 95];
    
    return percentiles.map(p => {
      // Position at this percentile (0-indexed)
      const position = Math.floor((p / 100) * totalCount);
      
      // Get the applicant at this position in current snapshot
      const applicant = curr.applicants![position];
      if (!applicant) return { percentile: p, position: position + 1, velocity: 0 };
      
      // Find their previous position
      const prevPosition = prev.applicants!.indexOf(applicant);
      
      if (prevPosition === -1) {
        // New applicant, can't calculate velocity
        return { percentile: p, position: position + 1, velocity: 0 };
      }
      
      // Calculate how many positions they moved per day
      const positionChange = prevPosition - position; // Positive = moved up
      const velocity = positionChange / days;
      
      return {
        percentile: p,
        position: position + 1, // 1-indexed for display
        velocity
      };
    });
  }

  function calculateVelocitySeries(event: PageEvent): { date: string; velocity: number }[] {
    if (!event.data || event.data.length < 2) return [];

    // Ensure data is sorted by date
    const sortedData = [...event.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const series: { date: string; velocity: number }[] = [];

    // Iterate through snapshots starting from the second one
    for (let i = 1; i < sortedData.length; i++) {
        const prev = sortedData[i - 1];
        const curr = sortedData[i];
        
        if (!curr.applicants || !prev.applicants) continue;

        // Cohort: Top 25 at current time t
        const cohort = curr.applicants.slice(0, 25);
        const velocities: number[] = [];

        const days = (new Date(curr.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24);
        if (days <= 0) continue;

        for (const applicant of cohort) {
            const prevPos = prev.applicants.indexOf(applicant);
            const currPos = curr.applicants.indexOf(applicant); // Should be index in cohort basically

            if (prevPos !== -1 && currPos !== -1) {
                 const posDiff = prevPos - currPos; // Positive = moved up
                 velocities.push(posDiff / days);
            }
        }

        if (velocities.length > 0) {
             const total = velocities.reduce((sum, v) => sum + v, 0);
             const mean = total / velocities.length;
             
             series.push({ date: curr.date, velocity: mean });
        }
    }
    return series;
  }

  interface RegressionResult {
    coefficients: number[];
    r2: number;
    equation: string;
    predict: (x: number) => number;
    trendPoints: { dayIndex: number; velocity: number }[];
    projectedVelocityAtRace: number | null;
    projectedPositionChange: number | null;
  }

  function calculateRegression(
    velocitySeries: { date: string; velocity: number }[],
    raceDate: string | null
  ): RegressionResult | null {
    const MIN_SAMPLES = 10;
    const MAX_PROJECTION = 500; // Cap projection at 500 positions
    const R2_THRESHOLD = 0.99; // R² above this suggests overfitting/few points
    
    if (velocitySeries.length < MIN_SAMPLES) return null;

    // Convert dates to day indices (0, 1, 2, ...) for regression
    const firstDate = new Date(velocitySeries[0].date).getTime();
    const data: [number, number][] = velocitySeries.map((d) => [
      Math.floor((new Date(d.date).getTime() - firstDate) / (1000 * 60 * 60 * 24)),
      d.velocity
    ]);

    const x = data.map(d => d[0]);
    const y = data.map(d => d[1]);
    const n = x.length;

    // Polynomial regression (degree 2) using least squares
    // Solve for coefficients [a, b, c] in y = a + bx + cx²
    // Using normal equations: (X'X)β = X'y
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumX3 = x.reduce((a, b) => a + b * b * b, 0);
    const sumX4 = x.reduce((a, b) => a + b * b * b * b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
    const sumX2Y = x.reduce((a, xi, i) => a + xi * xi * y[i], 0);

    // Normal equations matrix for quadratic: solve Ax = B
    // | n      sumX   sumX2  | | a |   | sumY   |
    // | sumX   sumX2  sumX3  | | b | = | sumXY  |
    // | sumX2  sumX3  sumX4  | | c |   | sumX2Y |
    
    // Using Cramer's rule for 3x3 system
    const det = n * (sumX2 * sumX4 - sumX3 * sumX3) 
              - sumX * (sumX * sumX4 - sumX3 * sumX2) 
              + sumX2 * (sumX * sumX3 - sumX2 * sumX2);
    
    if (Math.abs(det) < 1e-10) {
      // Fallback to linear if matrix is singular
      const regression = linearRegression(data);
      const predict = linearRegressionLine(regression);
      const r2 = rSquared(data, predict);
      
      if (r2 > R2_THRESHOLD) return null; // Hide if R² too high
      
      const maxDayIndex = Math.max(...x);
      const trendPoints: { dayIndex: number; velocity: number }[] = [];
      for (let i = 0; i <= maxDayIndex; i++) {
        trendPoints.push({ dayIndex: i, velocity: predict(i) });
      }
      
      let projectedPositionChange: number | null = null;
      if (raceDate) {
        const raceDayIndex = Math.floor((new Date(raceDate).getTime() - firstDate) / (1000 * 60 * 60 * 24));
        if (raceDayIndex > maxDayIndex) {
          const daysRemaining = raceDayIndex - maxDayIndex;
          const avgVelocity = predict((maxDayIndex + raceDayIndex) / 2);
          projectedPositionChange = Math.min(avgVelocity * daysRemaining, MAX_PROJECTION);
        }
      }
      
      return {
        coefficients: [regression.b, regression.m],
        r2,
        equation: `y = ${regression.m.toFixed(3)}x + ${regression.b.toFixed(2)}`.replace('+ -', '- '),
        predict,
        trendPoints,
        projectedVelocityAtRace: null,
        projectedPositionChange
      };
    }
    
    // Solve for a, b, c using Cramer's rule
    const detA = sumY * (sumX2 * sumX4 - sumX3 * sumX3) 
               - sumX * (sumXY * sumX4 - sumX3 * sumX2Y) 
               + sumX2 * (sumXY * sumX3 - sumX2 * sumX2Y);
    const detB = n * (sumXY * sumX4 - sumX3 * sumX2Y) 
               - sumY * (sumX * sumX4 - sumX3 * sumX2) 
               + sumX2 * (sumX * sumX2Y - sumXY * sumX2);
    const detC = n * (sumX2 * sumX2Y - sumXY * sumX3) 
               - sumX * (sumX * sumX2Y - sumXY * sumX2) 
               + sumY * (sumX * sumX3 - sumX2 * sumX2);
    
    const a = detA / det; // constant term
    const b = detB / det; // linear coefficient
    const c = detC / det; // quadratic coefficient
    
    const predict = (xi: number) => a + b * xi + c * xi * xi;
    
    // Calculate R²
    const yMean = sumY / n;
    const ssTot = y.reduce((acc, yi) => acc + (yi - yMean) ** 2, 0);
    const ssRes = y.reduce((acc, yi, i) => acc + (yi - predict(x[i])) ** 2, 0);
    const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
    
    if (r2 > R2_THRESHOLD) return null; // Hide if R² too high (overfitting)

    // Generate trend points
    const maxDayIndex = Math.max(...x);
    const trendPoints: { dayIndex: number; velocity: number }[] = [];
    for (let i = 0; i <= maxDayIndex; i++) {
      trendPoints.push({ dayIndex: i, velocity: predict(i) });
    }

    // Calculate race day projection with cap
    let projectedVelocityAtRace: number | null = null;
    let projectedPositionChange: number | null = null;
    
    if (raceDate) {
      const raceDayIndex = Math.floor(
        (new Date(raceDate).getTime() - firstDate) / (1000 * 60 * 60 * 24)
      );
      
      if (raceDayIndex > maxDayIndex) {
        // Extend trend to race day (but limit to reasonable range for display)
        const extendTo = Math.min(raceDayIndex, maxDayIndex + 60); // Max 60 days ahead
        for (let i = maxDayIndex + 1; i <= extendTo; i++) {
          trendPoints.push({ dayIndex: i, velocity: Math.max(0, predict(i)) });
        }
        projectedVelocityAtRace = predict(raceDayIndex);
        
        // Integrate using numerical approximation (trapezoidal)
        let totalChange = 0;
        for (let i = maxDayIndex; i < raceDayIndex; i++) {
          const v1 = Math.max(0, predict(i));
          const v2 = Math.max(0, predict(i + 1));
          totalChange += (v1 + v2) / 2;
        }
        // Cap the projection
        projectedPositionChange = Math.min(Math.max(-MAX_PROJECTION, totalChange), MAX_PROJECTION);
      }
    }

    // Format equation string (y = a + bx + cx²)
    const equation = `y = ${a.toFixed(2)} + ${b.toFixed(3)}x + ${c.toFixed(4)}x²`.replace(/\+ -/g, '- ');

    return {
      coefficients: [a, b, c],
      r2,
      equation,
      predict,
      trendPoints,
      projectedVelocityAtRace,
      projectedPositionChange
    };
  }

  let activeEvents = $derived(
    activeEventsBase.map((e: PageEvent) => {
      const velocitySeries = calculateVelocitySeries(e);
      const lastVelocity = velocitySeries.length > 0 ? velocitySeries[velocitySeries.length - 1].velocity : null;
      const regressionResult = calculateRegression(velocitySeries, race.date);
      const percentileStats = calculatePercentileVelocities(e);
      const competitiveness = calculateCompetitiveness(e.entrants);
      return {
        ...e,
        velocity: lastVelocity,
        velocitySeries,
        regression: regressionResult,
        percentileStats,
        competitiveness
      };
    })
  );

  // Pre-calculate snapshot maps for each event (1d, 7d, 30d)
  let diffMaps = $derived(
    activeEvents.reduce(
      (
        acc: Record<string, Record<number, Map<string, number>>>,
        event: PageEvent,
      ) => {
        if (!event.data || event.data.length === 0) return acc;

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const maps: Record<number, Map<string, number>> = {};

        [1, 7, 30].forEach((days) => {
          const targetDate = new Date(now.getTime() - days * oneDay);
          // Find closest snapshot
          const snapshot = event.data?.reduce(
            (closest: WaitlistSnapshot, curr: WaitlistSnapshot) => {
              const currDiff = Math.abs(
                new Date(curr.date).getTime() - targetDate.getTime(),
              );
              const closestDiff = Math.abs(
                new Date(closest.date).getTime() - targetDate.getTime(),
              );
              return currDiff < closestDiff ? curr : closest;
            },
          );

          const map = new Map<string, number>();
          if (snapshot && snapshot.applicants) {
            snapshot.applicants.forEach((name: string, idx: number) =>
              map.set(name, idx),
            );
          }
          maps[days] = map;
        });

        acc[event.id] = maps;
        return acc;
      },
      {} as Record<string, Record<number, Map<string, number>>>,
    ),
  );

  // Participants Logic
  let entrants = $derived(
    events.flatMap((e: PageEvent) =>
      (e.entrants || []).map((entrant: Participant) => ({
        ...entrant,
        eventTitle: e.title,
      })),
    ),
  );

  const HIGH_PERFORMER_RANK = 85;
  const MIN_RESULTS = 5;
  const QUALIFIED_QUOTA = 10;

  function getTopParticipants(
    allParticipants: Participant[],
    genderPrefix: string,
  ) {
    // 1. Filter by gender (M/F prefix in age string)
    const genderParticipants = allParticipants.filter(
      (e) => e.age && e.age.startsWith(genderPrefix),
    );

    // 2. Sort by Rank (descending)
    // Rank is already a number from Zod schema (0-100)
    const sorted = [...genderParticipants].sort(
      (a, b) => (b.rank || 0) - (a.rank || 0),
    );

    const topList = [];
    let count = 0;

    for (const e of sorted) {
      const results = e.results || 0;
      const rank = e.rank || 0;

      const isHighPerformer =
        rank > HIGH_PERFORMER_RANK && results > MIN_RESULTS;
      const isQualified = results >= MIN_RESULTS;

      // Always include high performers (>90% rank & >5 results)
      // OR if we haven't reached our quota of 5 qualified runners yet
      if (isHighPerformer || count < QUALIFIED_QUOTA) {
        topList.push(e);
        if (isQualified) {
          count++;
        }
      } else {
        // If we have 5 qualified runners and this isn't a high performer, stop
        // (Since list is sorted by rank, subsequent runners won't be high performers either)
        break;
      }
    }
    return topList;
  }

  let topMen = $derived(getTopParticipants(entrants, "M"));
  let topWomen = $derived(getTopParticipants(entrants, "F"));

  let athleteJsonLd = $derived(
    [...topMen, ...topWomen].map((athlete) => ({
      "@context": "https://schema.org",
      "@type": "Person",
      name: `${athlete.firstName} ${athlete.lastName}`,
      homeLocation: {
        "@type": "Place",
        name: athlete.location,
      },
      performerIn: {
        "@type": "Event",
        name: race.title,
        startDate: race.date,
        location: {
          "@type": "Place",
          name: race.location,
        },
      },
    })),
  );

  let title = $derived(`${race.title} ${race.year} Waitlist & Stats`);
  let description = $derived(
    `Detailed waitlist analysis, clearance rates, and statistics for the ${race.year} ${race.title}.`,
  );

  let jsonLd = $derived([
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://justin.poehnelt.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `${race.year} Waitlists`,
          item: `https://justin.poehnelt.com/ultras/races/${race.year}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: race.title,
          item: `https://justin.poehnelt.com/ultras/races/${race.year}/${race.slug}/${race.id}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${race.title} ${race.year}`,
      startDate: race.date || race.year,
      location: {
        "@type": "Place",
        name: race.location || "TBD",
      },
      description: description,
      url: `https://justin.poehnelt.com/ultras/races/${race.year}/${race.slug}/${race.id}`,
    },
  ]);

  function getPositionDiffs(
    eventId: string,
    applicant: string,
    currentIdx: number,
  ) {
    if (!diffMaps[eventId]) return { d1: 0, d7: 0, d30: 0 };

    const getDiff = (days: number) => {
      const pastIdx = diffMaps[eventId][days]?.get(applicant);
      if (pastIdx === undefined) return null;
      return pastIdx - currentIdx;
    };

    return {
      d1: getDiff(1),
      d7: getDiff(7),
      d30: getDiff(30),
    };
  }

  let searchTerms: Record<string, string> = $state({});
</script>

{#snippet ChangeIndicator(diff: number | null)}
  <div
    class={`flex items-center justify-end gap-1 text-xs font-bold w-full ${diff === null ? "text-gray-300" : diff === 0 ? "text-slate-300" : diff > 0 ? "text-green-500" : "text-green-500"}`}
  >
    {#if diff === null}
      <span class="text-slate-200">-</span>
    {:else if diff === 0}
      <svg class="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 12h14" />
      </svg>
    {:else if diff > 0}
      <svg class="w-3 h-3 text-green-500 fill-current" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <span>{diff}</span>
    {:else}
       <svg class="w-3 h-3 text-red-500 fill-current rotate-180" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      <span class="text-red-500">{Math.abs(diff)}</span>
    {/if}
  </div>
{/snippet}

{#snippet ParticipantList(
  list: Participant[],
  title: string,
  theme: "blue" | "rose",
)}
  <div
    class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden h-full"
  >
    <div
      class="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center"
    >
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <span
          class={`w-2 h-2 rounded-full ${theme === "blue" ? "bg-blue-600" : "bg-rose-500"}`}
        ></span>
        {title}
      </h3>
      <span class="text-xs font-semibold text-stone-400 uppercase tracking-wide"
        >Rank Score</span
      >
    </div>
    <div class="divide-y divide-stone-100">
      {#each list as m}
        <div
          class="px-6 py-4 hover:bg-stone-50 transition-colors flex items-center gap-4 group"
        >
          <div
            class={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ring-1 ring-stone-100 ${theme === "blue" ? "bg-slate-100 text-slate-500" : "bg-rose-50 text-rose-500"}`}
          >
            {m.firstName[0]}{m.lastName[0]}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-1">
              <div
                class={`font-bold text-slate-800 truncate transition-colors ${theme === "blue" ? "group-hover:text-blue-700" : "group-hover:text-rose-600"}`}
              >
                {m.firstName}
                {m.lastName}
              </div>
              <div
                class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full"
              >
                {m.results} results
              </div>
            </div>
            <div
              class="relative h-2 w-full bg-stone-100 rounded-full overflow-hidden"
            >
              <div
                class={`absolute h-full rounded-full transition-all duration-500 ease-out ${theme === "blue" ? "bg-blue-500" : "bg-rose-500"}`}
                style="width: {m.rank}%"
              ></div>
            </div>
            <div class="flex justify-between mt-1.5 text-xs text-stone-500">
              <div class="flex items-center gap-1">
                <svg
                  class="w-3 h-3 text-stone-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  /><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  /></svg
                >
                {m.location}
              </div>
              <div
                class={`font-mono font-bold ${theme === "blue" ? "text-blue-600" : "text-rose-600"}`}
                title="Rank Score"
              >
                {m.rank}%
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/snippet}

<svelte:head>
  <title>{race.year} {race.title} Waitlist Analysis</title>
  {#each athleteJsonLd as ld}
    {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
  {/each}
</svelte:head>

<div class="min-h-screen bg-stone-50 pb-20">
  <!-- Hero Section -->
  <div class="relative bg-slate-900 text-stone-100 overflow-hidden">
    <div
      class="absolute inset-0 opacity-10"
      style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
    ></div>

    <div class="relative container mx-auto px-6 py-12 md:py-20">
      <Breadcrumb.Root class="mb-6">
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link
              href="/"
              class="text-stone-400 hover:text-white transition-colors"
              >Home</Breadcrumb.Link
            >
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="text-stone-600" />
          <Breadcrumb.Item>
            <Breadcrumb.Link
              href="/ultras/races"
              class="text-stone-400 hover:text-white transition-colors"
              >Races</Breadcrumb.Link
            >
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="text-stone-600" />
          <Breadcrumb.Item>
            <Breadcrumb.Link
              href="/ultras/races/{race.year}"
              class="text-stone-400 hover:text-white transition-colors"
              >{race.year}</Breadcrumb.Link
            >
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="text-stone-600" />
          <Breadcrumb.Item>
            <Breadcrumb.Link
              href="/ultras/races/{race.year}/{race.slug}/{race.id}"
              class="text-stone-400 hover:text-white transition-colors"
              >{race.title}</Breadcrumb.Link
            >
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="text-stone-600" />
          <Breadcrumb.Item>
            <Breadcrumb.Page
              class="text-white font-medium max-w-[150px] md:max-w-none truncate"
              >{events[0]?.title}</Breadcrumb.Page
            >
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            {#if activeEvents.length > 0}
              <span
                class="px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-semibold tracking-wide border border-orange-600/30"
                >WAITLIST ACTIVE</span
              >
            {:else}
              <span
                class="px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 text-xs font-semibold tracking-wide border border-slate-600/50"
                >REGISTRATION OPEN</span
              >
            {/if}
            <span
              class="text-stone-400 text-sm font-medium tracking-wide uppercase"
              >{race.date
                ? new Date(race.date).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : race.year}</span
            >
          </div>
          <div class="flex flex-col gap-1 mb-2">
            <div class="text-xl md:text-2xl font-bold text-stone-400">
              {race.title}
            </div>
            <h1
              class="text-4xl md:text-6xl font-black tracking-tight text-white"
            >
              {events[0]?.title}
            </h1>
          </div>
          <div class="flex items-center text-stone-300 gap-2 mb-6">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              ></path><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              ></path></svg
            >
            <span class="text-lg font-medium">{race.location}</span>
          </div>

          {#if race.events && race.events.filter((e: any) => String(e.id) !== String(activeEvents[0]?.id)).length > 0}
            <div class="flex flex-wrap gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wider text-stone-500 py-1.5"
                >Other Distances:</span
              >
              {#each race.events.filter((e: any) => String(e.id) !== String(activeEvents[0]?.id)) as sibling}
                <a
                  href="/ultras/races/{race.year}/{race.slug}/{race.id}/{sibling.id}"
                  class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600/20 hover:border-orange-500/50 border border-slate-700 text-stone-300 hover:text-orange-200 text-xs font-bold uppercase tracking-wide transition-all"
                >
                  {sibling.title}
                </a>
              {/each}
            </div>
          {/if}
        </div>

        {#if activeEvents.length > 0}
          {@const totalWaitlist = activeEvents.reduce(
            (acc: number, e: PageEvent) =>
              acc +
              (e.data && e.data.length > 0
                ? e.data[e.data.length - 1]?.count || 0
                : 0),
            0,
          )}
          {@const heroCompetitiveness = activeEvents[0]?.competitiveness}
          <div class="flex gap-4">
            <div
              class="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl"
            >
              <div
                class="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1"
              >
                Waitlist Size
              </div>
              <div class="text-4xl font-black text-white">
                {totalWaitlist.toLocaleString()}
              </div>
              <div
                class="text-xs text-green-400 font-medium mt-1 flex items-center gap-1"
              >
                Total Applicants
              </div>
            </div>
            {#if heroCompetitiveness}
              <div
                class="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl"
              >
                <div
                  class="text-stone-400 text-xs font-semibold uppercase tracking-wider mb-1"
                >
                  Field Strength
                </div>
                <div class="text-4xl font-black text-white">
                  {heroCompetitiveness.averageRank.toFixed(0)}
                </div>
                <div
                  class="text-xs text-purple-400 font-medium mt-1 flex items-center gap-1"
                >
                  {heroCompetitiveness.eliteCount} Elite (90+)
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="container mx-auto px-6 -mt-8 relative z-10 space-y-8">
    {#if activeEvents.length > 0}
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Waitlist Analysis</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Statistics (moved before chart) -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium mb-4">Statistics</h3>
            <div class="space-y-4">
              {#each activeEvents as event}
                {#if event.data && event.data.length > 0}
                  {@const last = event.data[event.data.length - 1]}
                  <div class="border-b pb-4 last:border-0 last:pb-0">
                    <div class="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">{event.title}</div>
                    
                    {#if event.competitiveness}
                      <div class="mb-4">
                        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Field Strength</div>
                        
                        <div class="grid grid-cols-2 gap-2 mb-3">
                          <div class="bg-slate-50 rounded px-2 py-1.5">
                            <div class="text-xs text-stone-400">Avg Rank</div>
                            <div class="font-mono text-lg font-bold text-slate-700">{event.competitiveness.averageRank.toFixed(1)}</div>
                          </div>
                          <div class="bg-slate-50 rounded px-2 py-1.5">
                            <div class="text-xs text-stone-400">Median</div>
                            <div class="font-mono text-lg font-bold text-slate-700">{event.competitiveness.medianRank.toFixed(1)}</div>
                          </div>
                        </div>

                        <div class="space-y-1">
                          {#each event.competitiveness.rankDistribution as bucket}
                            <div class="flex items-center gap-2 text-xs">
                              <span class="w-12 text-stone-500 font-medium">{bucket.label}</span>
                              <div class="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  class="h-full rounded-full {bucket.label === '90+' ? 'bg-purple-500' : bucket.label === '80-89' ? 'bg-blue-500' : bucket.label === '60-79' ? 'bg-green-500' : 'bg-slate-400'}"
                                  style="width: {bucket.percent}%"
                                ></div>
                              </div>
                              <span class="w-8 text-right text-stone-400">{bucket.count}</span>
                            </div>
                          {/each}
                        </div>

                        {#if event.competitiveness.eliteCount > 0}
                          <div class="mt-2 text-xs text-purple-600 font-medium">
                            {event.competitiveness.eliteCount} elite runner{event.competitiveness.eliteCount > 1 ? 's' : ''} (90+ rank)
                          </div>
                        {/if}
                        <div class="mt-3 pt-2 border-t border-stone-100 text-xs text-stone-400 space-y-1">
                          <p><strong class="text-stone-500">About rankings:</strong> Based on UltraSignup rankings. Avg/Median calculated from {event.competitiveness.rankedEntrants} ranked runners (excludes unranked).</p>
                          <p class="text-stone-400/80">90+ = Elite • 80-89 = Strong • 60-79 = Experienced • &lt;60 = Developing/Unranked</p>
                        </div>
                      </div>
                    {/if}

                    <div class="grid grid-cols-2 gap-4">
                      <!-- Waitlist Size -->
                      <div class="bg-slate-50 rounded-lg p-3">
                        <div class="text-xs text-stone-400 uppercase tracking-wide mb-1">Waitlist Size</div>
                        <div class="text-2xl font-bold text-slate-800">{last.count}</div>
                      </div>
                      
                      <!-- Daily Position Change -->
                      {#if event.velocity !== null}
                        <div class="bg-slate-50 rounded-lg p-3">
                          <div class="text-xs text-stone-400 uppercase tracking-wide mb-1">Daily Movement</div>
                          <div class="text-2xl font-bold flex items-center gap-1 {event.velocity > 0 ? 'text-green-600' : event.velocity < 0 ? 'text-red-500' : 'text-slate-400'}">
                            {#if event.velocity > 0}
                              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                              </svg>
                            {:else if event.velocity < 0}
                              <svg class="w-4 h-4 fill-current rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                              </svg>
                            {/if}
                            <span>{Math.abs(event.velocity).toFixed(1)}</span>
                            <span class="text-sm font-normal text-stone-400">/day</span>
                          </div>
                        </div>
                      {/if}
                    </div>

                    {#if event.regression}
                      <div class="mt-4 pt-3 border-t border-stone-100">
                        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Trend Analysis</div>
                        <div class="space-y-1.5">
                          <div class="flex justify-between items-center text-sm">
                            <span class="text-stone-500">Model</span>
                            <code class="font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded text-xs">{event.regression.equation}</code>
                          </div>
                          <div class="flex justify-between items-center text-sm">
                            <span class="text-stone-500">Fit (R²)</span>
                            <span class="font-mono font-bold {event.regression.r2 > 0.7 ? 'text-green-600' : event.regression.r2 > 0.4 ? 'text-amber-600' : 'text-red-500'}">{(event.regression.r2 * 100).toFixed(1)}%</span>
                          </div>
                          {#if event.regression.projectedPositionChange !== null}
                            <div class="flex justify-between items-center text-sm">
                              <span class="text-stone-500">Est. by Race Day</span>
                              <span class="font-mono font-bold {event.regression.projectedPositionChange > 0 ? 'text-green-600' : 'text-red-500'}">
                                {event.regression.projectedPositionChange > 0 ? '+' : ''}{Math.round(event.regression.projectedPositionChange)} pos
                              </span>
                            </div>
                          {/if}
                        </div>
                      </div>
                    {/if}

                    {#if event.percentileStats && event.percentileStats.length > 0}
                      <div class="mt-4 pt-3 border-t border-stone-100">
                        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Movement by Position</div>
                        <div class="grid grid-cols-2 gap-2">
                          {#each event.percentileStats as stat}
                            <div class="bg-slate-50 rounded px-2 py-1.5 flex justify-between items-center">
                              <span class="text-xs text-stone-500">
                                #{stat.position}
                                <span class="text-stone-400">({stat.percentile}%)</span>
                              </span>
                              <span class="font-mono text-sm font-medium {stat.velocity > 0 ? 'text-green-600' : stat.velocity < 0 ? 'text-red-500' : 'text-slate-400'}">
                                {stat.velocity > 0 ? '+' : ''}{stat.velocity.toFixed(1)}/d
                              </span>
                            </div>
                          {/each}
                        </div>
                        <div class="text-xs text-stone-400 mt-2 italic">
                          Daily position change at each rank
                        </div>
                      </div>
                    {/if}

                    <div class="text-xs text-gray-400 mt-3">
                      Updated: {new Date(last.date).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>

          <!-- Waitlist Trends Chart -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium mb-4">Waitlist Trends</h3>
            {#if activeEvents.some((e: any) => e.data && e.data.length > 1)}
              <WaitlistChart 
                events={activeEvents.map((e: any) => ({
                  title: e.title,
                  data: e.data || [],
                  velocityData: e.velocitySeries || [],
                  regression: e.regression
                }))} 
                raceDate={race.date}
              />
            {:else}
              <p class="text-gray-500">
                Not enough data to calculate velocity yet.
              </p>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    {#if activeEvents.length === 0 && entrants.length === 0}
      <div
        class="p-12 text-center border-2 border-dashed border-stone-300 rounded-2xl bg-white/50 mb-8"
      >
        <p class="text-stone-500 text-lg">
          No data available for this category yet.
        </p>
      </div>
    {/if}

    {#if entrants.length > 0}
      <div class="mb-12">
        <h2 class="text-2xl font-black text-slate-800 mb-6 tracking-tight">
          Field
        </h2>

        <!-- Mobile Tabs -->
        <div class="lg:hidden">
          <Tabs.Root value="men" class="w-full">
            <Tabs.List
              class="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl"
            >
              <Tabs.Trigger
                value="men"
                class="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-500 font-bold"
                >Top Men</Tabs.Trigger
              >
              <Tabs.Trigger
                value="women"
                class="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-500 font-bold"
                >Top Women</Tabs.Trigger
              >
            </Tabs.List>
            <Tabs.Content value="men">
              {@render ParticipantList(topMen, "Top Men", "blue")}
            </Tabs.Content>
            <Tabs.Content value="women">
              {@render ParticipantList(topWomen, "Top Women", "rose")}
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <!-- Desktop Grid -->
        <div class="hidden lg:grid grid-cols-2 gap-8">
          {@render ParticipantList(topMen, "Top Men", "blue")}
          {@render ParticipantList(topWomen, "Top Women", "rose")}
        </div>
      </div>
    {/if}

    <!-- Full Waitlist Section -->
    {#if activeEvents.some((e: PageEvent) => e.data && e.data.length > 0 && e.data[e.data.length - 1].applicants?.length > 0)}
      <div class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each activeEvents as event}
            {#if event.data && event.data.length > 0}
              {@const last = event.data[event.data.length - 1]}
              {#if last.applicants && last.applicants.length > 0}
                <div
                  class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mt-8"
                >
                  <div
                    class="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row justify-between items-center gap-4"
                  >
                    <h3
                      class="font-bold text-slate-800 flex items-center gap-2"
                    >
                      <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                      Waitlist Applicants
                      <span
                        class="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full"
                        >{last.applicants.length} Total</span
                      >
                    </h3>
                    <div class="relative w-full md:w-64">
                      <div
                        class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
                      >
                        <svg
                          class="w-4 h-4 text-slate-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id={`search-${event.id}`}
                        class="block w-full p-2 ps-10 text-sm text-slate-700 border border-slate-200 rounded-lg bg-white focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Search applicants..."
                        bind:value={searchTerms[event.id]}
                      />
                    </div>
                  </div>

                  <div class="overflow-x-auto max-h-[800px] overflow-y-auto">
                    <table class="w-full text-sm text-left">
                      <thead
                        class="text-xs text-slate-500 uppercase bg-stone-50 sticky top-0 z-10 shadow-sm"
                      >
                        <tr>
                          <th class="px-4 py-3 font-semibold w-16 text-center"
                            >Pos</th
                          >
                          <th class="px-4 py-3 font-semibold">Name</th>
                          <th class="px-4 py-3 font-semibold text-right">1D</th>
                          <th class="px-4 py-3 font-semibold text-right">7D</th>
                          <th class="px-4 py-3 font-semibold text-right">30D</th
                          >
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-stone-100 bg-white">
                        {#each last.applicants
                          .map((name: string, i: number) => ({ name, i }))
                          .filter((item: { name: string; i: number }) => !searchTerms[event.id] || item.name
                                .toLowerCase()
                                .includes(searchTerms[event.id].toLowerCase())) as item}
                          {@const diffs = getPositionDiffs(
                            event.id,
                            item.name,
                            item.i,
                          )}
                          <tr
                            class="hover:bg-orange-50/50 transition-colors group"
                          >
                            <td
                              class="px-4 py-3 font-mono text-xs text-slate-400 text-center"
                              >{item.i + 1}</td
                            >
                            <td class="px-4 py-3 font-medium text-slate-700">
                              <a
                                href={`https://ultrasignup.com/results_participant.aspx?fname=${item.name.split(" ")[0]}&lname=${item.name.split(" ").slice(1).join(" ")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:text-orange-600 hover:underline transition-colors"
                              >
                                {item.name}
                              </a>
                            </td>
                            <td class="px-4 py-3 text-right"
                              >{@render ChangeIndicator(diffs.d1)}</td
                            >
                            <td class="px-4 py-3 text-right"
                              >{@render ChangeIndicator(diffs.d7)}</td
                            >
                            <td class="px-4 py-3 text-right"
                              >{@render ChangeIndicator(diffs.d30)}</td
                            >
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                </div>
              {/if}
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
