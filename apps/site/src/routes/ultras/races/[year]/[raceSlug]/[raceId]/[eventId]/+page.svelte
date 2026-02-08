<script lang="ts">
  import WaitlistChart from "$lib/components/WaitlistChart.svelte";
  import WaitlistTable from "$lib/components/WaitlistTable.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import * as Tabs from "$lib/components/ui/tabs";
  import type { Post } from "$lib/content/posts.shared";

  // Race analytics components
  import {
    FieldStrengthCard,
    FieldAnalysisPeers,
    WaitlistStatsCard,
    RaceHeroSection,
  } from "$lib/components/race";
  import type {
    CompetitivenessStats,
    PageEvent,
    EnrichedPageEvent,
    PercentileStats,
    WaitlistProjection,
    RegressionResult,
    Race,
    WaitlistSnapshot,
    Participant,
    RaceEventSummary,
    WaitlistHistory,
  } from "$lib/components/race/types";
  import {
    raceYearUrl,
    raceUrl,
    raceEventUrl,
    absoluteRaceYearUrl,
    absoluteRaceUrl,
    absoluteRaceEventUrl,
  } from "$lib/race-urls";
  import {
    linearRegression,
    linearRegressionLine,
    rSquared,
  } from "simple-statistics";

  let { data } = $props<{
    data: { race: Race; events: PageEvent[]; relatedPosts: Post[] };
  }>();

  let race = $derived(data.race);
  let events = $derived(data.events || []);
  let relatedPosts = $derived(data.relatedPosts || []);
  let enrichment = $derived(data.enrichment);
  // Strict: yearStats is guaranteed by server check
  let yearStats = $derived(data.yearStats);
  let peers = $derived(enrichment?.peers || []);
  let strongestFields = $derived(enrichment?.strongestFields || []);

  // ... existing code ...

  const THEME = {
    primary: "text-orange-700",
    bgPrimary: "bg-orange-700",
    secondary: "text-slate-600",
    bgSecondary: "bg-slate-600",
    accent: "text-stone-500",
    bgAccent: "bg-stone-100",
  };

  function calculateCompetitiveness(
    entrants: Participant[] | null,
  ): CompetitivenessStats | null {
    if (!entrants || entrants.length === 0) return null;

    // For accurate rankings, only include runners with 5+ results (UltraSignup requirement)
    const MIN_RESULTS_FOR_RANKING = 5;
    const qualifiedEntrants = entrants.filter(
      (e) =>
        e.rank && e.rank > 0 && (e.results ?? 0) >= MIN_RESULTS_FOR_RANKING,
    );
    const insufficientResultsCount = entrants.filter(
      (e) => e.rank && e.rank > 0 && (e.results ?? 0) < MIN_RESULTS_FOR_RANKING,
    ).length;
    const unrankedCount = entrants.filter(
      (e) => !e.rank || e.rank === 0,
    ).length;

    const ranks = qualifiedEntrants.map((e) => e.rank!).sort((a, b) => b - a);

    if (ranks.length === 0) return null;

    const eliteCount = ranks.filter((r) => r >= 90).length;
    const strongCount = ranks.filter((r) => r >= 80 && r < 90).length;
    const midPackCount = ranks.filter((r) => r >= 60 && r < 80).length;
    const newcomerCount = ranks.filter((r) => r > 0 && r < 60).length;

    const sum = ranks.reduce((a, b) => a + b, 0);
    const averageRank = sum / ranks.length;
    const medianRank = ranks[Math.floor(ranks.length / 2)];

    // Calculate Top 20 Stats
    const top20Ranks = ranks.slice(0, 20);
    const top20Rank = ranks.length >= 20 ? ranks[19] : null;
    const top20Average =
      top20Ranks.length > 0
        ? top20Ranks.reduce((a, b) => a + b, 0) / top20Ranks.length
        : null;

    // Get top 10 runners (from qualified entrants only)
    const topRunners = qualifiedEntrants
      .sort((a, b) => (b.rank || 0) - (a.rank || 0))
      .slice(0, 10)
      .map((e) => ({
        name: `${e.firstName} ${e.lastName}`,
        rank: e.rank || 0,
        location: e.location || "",
      }));

    // Create distribution buckets
    const totalForPercent = entrants.length;
    const newRunnersCount = insufficientResultsCount + unrankedCount;
    const rankDistribution = [
      {
        label: "90+",
        count: eliteCount,
        percent: totalForPercent > 0 ? (eliteCount / totalForPercent) * 100 : 0,
      },
      {
        label: "80-89",
        count: strongCount,
        percent:
          totalForPercent > 0 ? (strongCount / totalForPercent) * 100 : 0,
      },
      {
        label: "60-79",
        count: midPackCount,
        percent:
          totalForPercent > 0 ? (midPackCount / totalForPercent) * 100 : 0,
      },
      {
        label: "<60",
        count: newcomerCount,
        percent:
          totalForPercent > 0 ? (newcomerCount / totalForPercent) * 100 : 0,
      },
      {
        label: "New",
        count: newRunnersCount,
        percent:
          totalForPercent > 0 ? (newRunnersCount / totalForPercent) * 100 : 0,
      },
    ];

    return {
      totalEntrants: entrants.length,
      rankedEntrants: qualifiedEntrants.length,
      insufficientResultsCount,
      unrankedCount,
      averageRank,
      medianRank,
      eliteCount,
      strongCount,
      midPackCount,
      newcomerCount,
      topRunners,
      rankDistribution,
      top20Rank,
      top20Average,
    };
  }

  // Inject fallback data for events with no waitlist, instead of filtering out
  let activeEventsBase = $derived(
    events.map((e: PageEvent) => {
      // If data exists and has count > 0, return as is
      if (e.data && e.data.length > 0) {
        const lastPoint = e.data[e.data.length - 1];
        if ((lastPoint?.count || 0) > 0) return e;
      }

      // Otherwise inject fallback (count 0)
      return {
        ...e,
        data: [
          {
            date: new Date().toISOString(),
            count: 0,
            applicants: [],
          },
        ],
      };
    }),
  );

  function calculatePercentileVelocities(event: PageEvent): PercentileStats[] {
    if (!event.data || event.data.length < 2) return [];

    const sortedData = [...event.data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Get snapshots with applicant data
    const withApplicants = sortedData.filter(
      (d) => d.applicants && d.applicants.length > 0,
    );
    if (withApplicants.length < 2) return [];

    const last = withApplicants[withApplicants.length - 1];
    if (!last.applicants) return [];

    // Find the snapshot closest to 7 days ago as our baseline
    const sevenDaysAgo = new Date(
      new Date(last.date).getTime() - 7 * 24 * 60 * 60 * 1000,
    );
    const baseline = withApplicants.reduce((closest, curr) => {
      const currDiff = Math.abs(
        new Date(curr.date).getTime() - sevenDaysAgo.getTime(),
      );
      const closestDiff = Math.abs(
        new Date(closest.date).getTime() - sevenDaysAgo.getTime(),
      );
      return currDiff < closestDiff ? curr : closest;
    });

    // Don't compare a snapshot to itself
    if (baseline === last || !baseline.applicants) return [];

    const totalCount = last.count;
    const percentiles = [0, 33, 66];

    return percentiles.map((p) => {
      // Position at this percentile (0-indexed)
      const position = Math.floor((p / 100) * totalCount);

      // Get the applicant at this position in current snapshot
      const applicant = last.applicants![position];
      if (!applicant)
        return { percentile: p, position: position + 1, velocity: 0 };

      // Find their position in baseline (7 days ago) snapshot
      const baselinePosition = baseline.applicants!.indexOf(applicant);

      if (baselinePosition === -1) {
        // Applicant wasn't on the waitlist 7 days ago
        return { percentile: p, position: position + 1, velocity: 0 };
      }

      // Calculate position change over the 7D window (positive = moved up)
      const positionChange = baselinePosition - position;

      return {
        percentile: p,
        position: position + 1, // 1-indexed for display
        velocity: positionChange,
      };
    });
  }

  function calculateVelocitySeries(event: PageEvent): {
    avg: { date: string; velocity: number }[];
    front: { date: string; velocity: number }[];
    median: { date: string; velocity: number }[];
  } {
    if (!event.data || event.data.length < 2)
      return { avg: [], front: [], median: [] };

    // Ensure data is sorted by date
    const sortedData = [...event.data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const avgSeries: { date: string; velocity: number }[] = [];
    const frontSeries: { date: string; velocity: number }[] = [];
    const medianSeries: { date: string; velocity: number }[] = [];

    // Iterate through snapshots starting from the second one
    for (let i = 1; i < sortedData.length; i++) {
      const prev = sortedData[i - 1];
      const curr = sortedData[i];

      if (!curr.applicants || !prev.applicants) continue;

      const days =
        (new Date(curr.date).getTime() - new Date(prev.date).getTime()) /
        (1000 * 60 * 60 * 24);
      if (days <= 0) continue;

      // Track movement of person at front of waitlist (position 0)
      const frontApplicant = curr.applicants[0];
      if (frontApplicant) {
        const prevFrontPos = prev.applicants.indexOf(frontApplicant);
        if (prevFrontPos !== -1) {
          frontSeries.push({
            date: curr.date,
            velocity: (prevFrontPos - 0) / days,
          });
        }
      }

      // Track movement of person at middle of waitlist
      const midIndex = Math.floor(curr.applicants.length / 2);
      const midApplicant = curr.applicants[midIndex];
      if (midApplicant) {
        const prevMidPos = prev.applicants.indexOf(midApplicant);
        if (prevMidPos !== -1) {
          medianSeries.push({
            date: curr.date,
            velocity: (prevMidPos - midIndex) / days,
          });
        }
      }

      // Average velocity across all tracked applicants (for regression)
      const velocities: number[] = [];
      for (const applicant of curr.applicants) {
        const prevPos = prev.applicants.indexOf(applicant);
        const currPos = curr.applicants.indexOf(applicant);
        if (prevPos !== -1 && currPos !== -1) {
          velocities.push((prevPos - currPos) / days);
        }
      }
      if (velocities.length > 0) {
        const total = velocities.reduce((sum, v) => sum + v, 0);
        avgSeries.push({
          date: curr.date,
          velocity: total / velocities.length,
        });
      }
    }
    return { avg: avgSeries, front: frontSeries, median: medianSeries };
  }

  function calculateRegression(
    velocitySeries: { date: string; velocity: number }[],
    raceDate: string | null,
  ): RegressionResult | null {
    const MIN_SAMPLES = 30; // User suggested 30+ days for accuracy
    const MAX_PROJECTION = 500; // Cap projection at 500 positions
    const R2_THRESHOLD = 0.99; // R² above this suggests overfitting/few points

    if (velocitySeries.length < MIN_SAMPLES) return null;

    // Convert dates to day indices (0, 1, 2, ...) for regression
    const firstDate = new Date(velocitySeries[0].date).getTime();
    const data: [number, number][] = velocitySeries.map((d) => [
      Math.floor(
        (new Date(d.date).getTime() - firstDate) / (1000 * 60 * 60 * 24),
      ),
      d.velocity,
    ]);

    const x = data.map((d) => d[0]);
    const y = data.map((d) => d[1]);
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
    const det =
      n * (sumX2 * sumX4 - sumX3 * sumX3) -
      sumX * (sumX * sumX4 - sumX3 * sumX2) +
      sumX2 * (sumX * sumX3 - sumX2 * sumX2);

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
        const raceDayIndex = Math.floor(
          (new Date(raceDate).getTime() - firstDate) / (1000 * 60 * 60 * 24),
        );
        if (raceDayIndex > maxDayIndex) {
          const daysRemaining = raceDayIndex - maxDayIndex;
          const avgVelocity = predict((maxDayIndex + raceDayIndex) / 2);
          projectedPositionChange = Math.min(
            avgVelocity * daysRemaining,
            MAX_PROJECTION,
          );
        }
      }

      return {
        coefficients: [regression.b, regression.m],
        r2,
        equation:
          `y = ${regression.m.toFixed(3)}x + ${regression.b.toFixed(2)}`.replace(
            "+ -",
            "- ",
          ),
        predict,
        trendPoints,
        projectedVelocityAtRace: null,
        projectedPositionChange: projectedPositionChange
          ? Math.min(projectedPositionChange, MAX_PROJECTION)
          : null,
      };
    }

    // Solve for a, b, c using Cramer's rule
    const detA =
      sumY * (sumX2 * sumX4 - sumX3 * sumX3) -
      sumX * (sumXY * sumX4 - sumX3 * sumX2Y) +
      sumX2 * (sumXY * sumX3 - sumX2 * sumX2Y);
    const detB =
      n * (sumXY * sumX4 - sumX3 * sumX2Y) -
      sumY * (sumX * sumX4 - sumX3 * sumX2) +
      sumX2 * (sumX * sumX2Y - sumXY * sumX2);
    const detC =
      n * (sumX2 * sumX2Y - sumXY * sumX3) -
      sumX * (sumX * sumX2Y - sumXY * sumX2) +
      sumY * (sumX * sumX3 - sumX2 * sumX2);

    const a = detA / det; // constant term
    const b = detB / det; // linear coefficient
    const c = detC / det; // quadratic coefficient

    const predict = (xi: number) => a + b * xi + c * xi * xi;

    // Calculate R²
    const yMean = sumY / n;
    const ssTot = y.reduce((acc, yi) => acc + (yi - yMean) ** 2, 0);
    const ssRes = y.reduce((acc, yi, i) => acc + (yi - predict(x[i])) ** 2, 0);
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

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
        (new Date(raceDate).getTime() - firstDate) / (1000 * 60 * 60 * 24),
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
        projectedPositionChange = Math.min(
          Math.max(-MAX_PROJECTION, totalChange),
          MAX_PROJECTION,
        );
      }
    }

    // Format equation string (y = a + bx + cx²)
    const equation =
      `y = ${a.toFixed(2)} + ${b.toFixed(3)}x + ${c.toFixed(4)}x²`.replace(
        /\+ -/g,
        "- ",
      );

    return {
      coefficients: [a, b, c],
      r2,
      equation,
      predict,
      trendPoints,
      projectedVelocityAtRace,
      projectedPositionChange,
    };
  }

  function calculateWaitlistRegression(
    eventData: PageEvent["data"] | undefined,
    raceDate: string | null,
  ): WaitlistProjection | null {
    if (!eventData || eventData.length < 30) return null; // Need 30+ days for accuracy

    // Sort by date
    const sortedData = [...eventData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Convert to [dayIndex, count]
    const firstDate = new Date(sortedData[0].date).getTime();
    const data: [number, number][] = sortedData.map((d) => [
      Math.floor(
        (new Date(d.date).getTime() - firstDate) / (1000 * 60 * 60 * 24),
      ),
      d.count,
    ]);

    const x = data.map((d) => d[0]);
    const y = data.map((d) => d[1]);
    const n = x.length;

    // Quadratic Regression: y = a + bx + cx^2
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumX3 = x.reduce((a, b) => a + b * b * b, 0);
    const sumX4 = x.reduce((a, b) => a + b * b * b * b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
    const sumX2Y = x.reduce((a, xi, i) => a + xi * xi * y[i], 0);

    // Matrix Determinants for Cramer's Rule
    const det =
      n * (sumX2 * sumX4 - sumX3 * sumX3) -
      sumX * (sumX * sumX4 - sumX3 * sumX2) +
      sumX2 * (sumX * sumX3 - sumX2 * sumX2);

    let predict: (xi: number) => number;
    let r2 = 0;

    if (Math.abs(det) < 1e-10) {
      // Fallback to Linear
      const regression = linearRegression(data);
      predict = linearRegressionLine(regression);
      r2 = rSquared(data, predict);
    } else {
      // Solve Quadratic
      const detA =
        sumY * (sumX2 * sumX4 - sumX3 * sumX3) -
        sumX * (sumXY * sumX4 - sumX3 * sumX2Y) +
        sumX2 * (sumXY * sumX3 - sumX2 * sumX2Y);
      const detB =
        n * (sumXY * sumX4 - sumX3 * sumX2Y) -
        sumY * (sumX * sumX4 - sumX3 * sumX2) +
        sumX2 * (sumX * sumX2Y - sumXY * sumX2);
      const detC =
        n * (sumX2 * sumX2Y - sumXY * sumX3) -
        sumX * (sumX * sumX2Y - sumXY * sumX2) +
        sumY * (sumX * sumX3 - sumX2 * sumX2);

      const a = detA / det;
      const b = detB / det;
      const c = detC / det;
      predict = (xi: number) => a + b * xi + c * xi * xi;

      const yMean = sumY / n;
      const ssTot = y.reduce((acc, yi) => acc + (yi - yMean) ** 2, 0);
      const ssRes = y.reduce(
        (acc, yi, i) => acc + (yi - predict(x[i])) ** 2,
        0,
      );
      r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
    }

    if (r2 < 0.1) return null; // Ignore very poor fits

    // Generate full trend line from start to race day
    const trendPoints: { date: string; count: number }[] = [];
    const maxDayIndex = Math.max(...x);
    let raceDayIndex = maxDayIndex;

    if (raceDate) {
      raceDayIndex = Math.floor(
        (new Date(raceDate).getTime() - firstDate) / (1000 * 60 * 60 * 24),
      );
    }

    // Generate points for the entire range (start to race day)
    for (let i = 0; i <= raceDayIndex; i++) {
      const d = new Date(firstDate + i * 1000 * 60 * 60 * 24);
      trendPoints.push({
        date: d.toISOString(),
        count: Math.round(predict(i)),
      });
    }

    // Ensure accurate last point
    const finalCount = Math.round(predict(raceDayIndex));

    // Sanity checks
    const currentMax = Math.max(...y);
    const currentCount = y[y.length - 1];

    // 1. Curvature check
    // High curvature means the trend is accelerating unrealistically
    // With x in days, c > 0.05 is HUGE acceleration (1 person/day^2 => 100 people/day after 10 days)
    // We only care if c is used (quadratic)
    if (Math.abs(det) >= 1e-10) {
      const detC =
        n * (sumX2 * sumX2Y - sumXY * sumX3) -
        sumX * (sumX * sumX2Y - sumXY * sumX2) +
        sumY * (sumX * sumX3 - sumX2 * sumX2);
      const c = detC / det;
      if (Math.abs(c) > 0.05) return null;
    }

    // 2. Growth check (stricter)
    if (finalCount > currentMax * 1.1) return null;

    // 3. Rapid clearing check
    const daysToRace = raceDayIndex - maxDayIndex;
    if (finalCount === 0 && daysToRace > 1 && currentCount > 200) {
      if (daysToRace < 10) return null;
    }

    if (r2 < 0.2) return null; // Stricter R2

    return {
      projectedCount: Math.max(0, finalCount),
      trendPoints,
      r2,
    };
  }

  let activeEvents = $derived(
    activeEventsBase.map((e: PageEvent) => {
      const velocitySeries = calculateVelocitySeries(e);
      const regressionResult = calculateRegression(
        velocitySeries.avg,
        race.date,
      );
      const percentileStats = calculatePercentileVelocities(e);
      const competitiveness = calculateCompetitiveness(e.entrants);
      const waitlistProjection = calculateWaitlistRegression(e.data, race.date);

      // Calculate 7D movement as average of percentile velocities for consistency
      const movement7d =
        percentileStats.length > 0
          ? Math.round(
              percentileStats.reduce((sum, p) => sum + p.velocity, 0) /
                percentileStats.length,
            )
          : null;

      return {
        ...e,
        velocity: movement7d,
        velocitySeries: velocitySeries.avg,
        frontSeries: velocitySeries.front,
        medianSeries: velocitySeries.median,
        regression: regressionResult,
        waitlistProjection,
        percentileStats,
        competitiveness,
      };
    }),
  );

  // Pre-calculate snapshot maps for each event (1d, 7d, 30d)
  let diffMaps = $derived(
    activeEvents.reduce(
      (
        acc: Record<string, Record<number, Map<string, number>>>,
        event: EnrichedPageEvent,
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
        title: e.title,
      })),
    ),
  );

  // Calculate field competitiveness from all entrants (regardless of waitlist)
  let fieldCompetitiveness = $derived(calculateCompetitiveness(entrants));

  // Hero stats - calculate once for template
  let totalWaitlist = $derived(
    activeEvents.reduce(
      (acc: number, e: PageEvent) =>
        acc +
        (e.data && e.data.length > 0
          ? e.data[e.data.length - 1]?.count || 0
          : 0),
      0,
    ),
  );
  let heroCompetitiveness = $derived(
    fieldCompetitiveness || activeEvents[0]?.competitiveness,
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

  // Check if race has already happened
  let isRacePast = $derived.by(() => {
    if (!race.date) return false;
    const raceDate = new Date(race.date);
    return raceDate < new Date();
  });

  let title = $derived.by(() => {
    const waitlistSize =
      activeEvents[0]?.data?.[activeEvents[0].data.length - 1]?.applicants
        ?.length ?? 0;

    // After race day, pivot to analysis-focused title for future registrants
    if (isRacePast) {
      return `${race.title} ${race.year} ${events[0]?.title} - Field Analysis & Competitiveness`;
    }

    if (waitlistSize > 0) {
      return `${race.title} ${race.year} Waitlist (${waitlistSize} people) - Clearance Rates & Movement`;
    }
    return `${race.title} ${race.year} ${events[0]?.title} - Stats & Analysis`;
  });

  let description = $derived.by(() => {
    const waitlistSize =
      activeEvents[0]?.data?.[activeEvents[0].data.length - 1]?.applicants
        ?.length ?? 0;
    const velocity = activeEvents[0]?.velocity;
    const competitiveness = activeEvents[0]?.competitiveness;

    // After race day, focus on field strength and analysis
    if (isRacePast) {
      let desc = `${race.year} ${race.title} ${events[0]?.title ?? ""} race analysis. `;
      if (competitiveness) {
        desc += `Field had ${competitiveness.rankedEntrants} ranked runners with avg rank ${competitiveness.averageRank.toFixed(0)}. `;
      }
      desc += `View historical entrants, field competitiveness, and race insights.`;
      return desc;
    }

    if (waitlistSize > 0) {
      let desc = `${race.year} ${race.title} waitlist has ${waitlistSize} people. `;
      if (velocity && velocity > 0) {
        desc += `Currently moving ${velocity.toFixed(1)} spots/day. `;
      }
      desc += `Track waitlist movement, clearance history, and your chances of getting in.`;
      return desc;
    }
    return `Detailed statistics and field analysis for the ${race.year} ${race.title} ${events[0]?.title ?? ""}.`;
  });

  // FAQ structured data for search queries
  let faqJsonLd = $derived.by(() => {
    const waitlistSize =
      activeEvents[0]?.data?.[activeEvents[0].data.length - 1]?.applicants
        ?.length ?? 0;
    const competitiveness = activeEvents[0]?.competitiveness;

    // For past races: FAQ for people planning to register next year
    if (isRacePast) {
      const questions = [
        {
          "@type": "Question",
          name: `How long was the ${race.title} waitlist on race day?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              waitlistSize > 0
                ? `The ${race.year} ${race.title} ${events[0]?.title ?? ""} had ${waitlistSize} people still on the waitlist by race day.`
                : `The ${race.year} ${race.title} ${events[0]?.title ?? ""} waitlist cleared before race day.`,
          },
        },
        {
          "@type": "Question",
          name: `How competitive is the ${race.title} field?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: competitiveness
              ? `In ${race.year}, the field had ${competitiveness.rankedEntrants} ranked runners with an average rank of ${competitiveness.averageRank.toFixed(0)} and ${competitiveness.eliteCount} elite runners (90+ rank).`
              : `The ${race.title} attracts a competitive field. Check this page for detailed field analysis.`,
          },
        },

        {
          "@type": "Question",
          name: `How many people were signed up for the ${race.title} in ${race.year}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: competitiveness
              ? `The ${race.year} ${race.title} ${events[0]?.title ?? ""} had ${competitiveness.totalEntrants} registered entrants.`
              : `View this page for complete entrant statistics.`,
          },
        },
      ];

      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions,
      };
    }

    // For upcoming races with waitlist: FAQ for current waitlist questions
    if (waitlistSize === 0) return null;

    const velocity = activeEvents[0]?.velocity;

    const questions = [
      {
        "@type": "Question",
        name: `How many people are on the ${race.title} waitlist?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The ${race.year} ${race.title} ${events[0]?.title ?? ""} currently has ${waitlistSize} people on the waitlist.`,
        },
      },
      {
        "@type": "Question",
        name: `How fast is the ${race.title} waitlist moving?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            velocity && velocity > 0
              ? `The waitlist is currently moving at approximately ${velocity.toFixed(1)} positions per day.`
              : `The waitlist movement varies. Check the live tracker for current movement rates.`,
        },
      },
    ];

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions,
    };
  });

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
          item: absoluteRaceYearUrl(race.year),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: race.title,
          item: absoluteRaceUrl(race),
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
      url: absoluteRaceUrl(race),
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

  // Helper to transform applicants for WaitlistTable component
  function getWaitlistApplicants(eventId: string, applicants: string[]) {
    return applicants.map((name, i) => ({
      name,
      position: i + 1,
      ...getPositionDiffs(eventId, name, i),
    }));
  }

  let searchTerms: Record<string, string> = $state({});

  const INITIAL_VISIBLE_COUNT = 5;
  let showAllMen = $state(false);
  let showAllWomen = $state(false);
</script>

{#snippet ChangeIndicator(diff: number | null)}
  <div
    class={`flex items-center justify-end gap-1 text-xs font-bold w-full ${diff === null ? "text-gray-300" : diff === 0 ? "text-slate-300" : diff > 0 ? "text-green-500" : "text-green-500"}`}
  >
    {#if diff === null}
      <span class="text-slate-200">-</span>
    {:else if diff === 0}
      <svg
        class="w-3 h-3 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M5 12h14"
        />
      </svg>
    {:else if diff > 0}
      <svg
        class="w-3 h-3 text-green-500 fill-current"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{diff}</span>
    {:else}
      <svg
        class="w-3 h-3 text-red-500 fill-current rotate-180"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="text-red-500">{Math.abs(diff)}</span>
    {/if}
  </div>
{/snippet}

{#snippet ParticipantList(
  list: Participant[],
  title: string,
  theme: "blue" | "rose",
  expanded: boolean,
  onToggle: () => void,
)}
  <div
    class="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden h-full flex flex-col"
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
    <div class="divide-y divide-stone-100 flex-1">
      {#each list.slice(0, expanded ? undefined : INITIAL_VISIBLE_COUNT) as m}
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
    {#if list.length > INITIAL_VISIBLE_COUNT}
      <div class="p-2 bg-stone-50 border-t border-stone-100">
        <button
          onclick={onToggle}
          class={`w-full py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-colors ${theme === "blue" ? "text-blue-600 hover:bg-blue-50" : "text-rose-600 hover:bg-rose-50"}`}
        >
          {expanded ? "Show Less" : `Show all ${list.length} runners`}
        </button>
      </div>
    {/if}
  </div>
{/snippet}

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link
    rel="canonical"
    href={absoluteRaceEventUrl({
      year: race.year,
      slug: race.slug,
      raceId: race.id,
      eventId: events[0]?.id,
    })}
  />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta
    property="og:image"
    content={`${absoluteRaceEventUrl({ year: race.year, slug: race.slug, raceId: race.id, eventId: events[0]?.id })}/og.png`}
  />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta
    property="og:url"
    content={absoluteRaceEventUrl({
      year: race.year,
      slug: race.slug,
      raceId: race.id,
      eventId: events[0]?.id,
    })}
  />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta
    name="twitter:image"
    content={`${absoluteRaceEventUrl({ year: race.year, slug: race.slug, raceId: race.id, eventId: events[0]?.id })}/og.png`}
  />

  {#each jsonLd as ld}
    {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
  {/each}
  {#each athleteJsonLd as ld}
    {@html `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
  {/each}
  {#if faqJsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>`}
  {/if}
</svelte:head>

<div class="min-h-screen bg-stone-50 pb-20">
  <!-- Hero Section -->
  <RaceHeroSection
    {race}
    {events}
    {activeEvents}
    {totalWaitlist}
    {heroCompetitiveness}
    currentEventId={events[0]?.id}
  />

  <div class="container mx-auto px-6 -mt-8 relative z-10 space-y-8">
    <!-- Race Summary Card with Link Back -->
    {#if enrichment?.summary}
      <div
        class="bg-white rounded-2xl p-6 border border-stone-200 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div class="flex-1 min-w-0">
          <p class="text-stone-600 line-clamp-2">{enrichment.summary}</p>
        </div>
        <a
          href={raceUrl(race)}
          class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path></svg
          >
          View Race Details
        </a>
      </div>
    {/if}

    {#if activeEvents.length > 0}
      <div class="mb-8">
        <div class="flex flex-wrap gap-6">
          {#each activeEvents as event}
            {#if event.competitiveness}
              <!-- Field Strength Card -->
              <div
                id="field-strength"
                class="bg-white p-6 rounded-lg shadow flex-1 min-w-[320px] md:min-w-[400px]"
              >
                <h3 class="text-lg font-medium mb-4">Field Strength</h3>
                <FieldStrengthCard
                  competitiveness={event.competitiveness}
                  {yearStats}
                  eventTitle={event.title}
                />
              </div>

              <div
                id="field-comparison"
                class="bg-white p-6 rounded-lg shadow flex-1 min-w-[320px] md:min-w-[400px]"
              >
                <h3 class="text-lg font-medium mb-4">Field Comparison</h3>

                <!-- Field Strength Meter -->
                {#if yearStats && yearStats.maxTop20Rank > yearStats.minTop20Rank && event.competitiveness.top20Rank}
                  {@const strengthRange =
                    yearStats.maxTop20Rank - yearStats.minTop20Rank}
                  {@const strengthPosition = Math.max(
                    0,
                    Math.min(
                      100,
                      ((event.competitiveness.top20Rank -
                        yearStats.minTop20Rank) /
                        strengthRange) *
                        100,
                    ),
                  )}
                  <div class="mb-4">
                    <div class="flex justify-between items-end mb-1">
                      <span
                        class="text-[10px] font-bold uppercase tracking-wider text-slate-600"
                        >Field Strength Meter</span
                      >
                    </div>
                    <div
                      class="h-2 w-full bg-slate-100 rounded-full relative overflow-visible"
                    >
                      <div
                        class="absolute inset-0 rounded-full bg-gradient-to-r from-slate-200 via-blue-200 to-purple-300 opacity-60"
                      ></div>
                      <div
                        class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-slate-600 rounded-full shadow-sm z-10"
                        style="left: {strengthPosition}%;"
                        title="This event: {event.competitiveness.top20Rank.toFixed(
                          1,
                        )}% (Rank of 20th)"
                      ></div>
                    </div>
                    <div
                      class="flex justify-between text-[9px] text-slate-300 mt-0.5 font-medium uppercase"
                    >
                      <span>Weakest ({yearStats.minTop20Rank.toFixed(0)}%)</span
                      >
                      <span
                        >Strongest ({yearStats.maxTop20Rank.toFixed(0)}%)</span
                      >
                    </div>
                  </div>
                {/if}

                <FieldAnalysisPeers
                  racesForYear={strongestFields}
                  currentRaceId={event.id}
                  year={race.year}
                />
              </div>

              <div
                id="registration"
                class="bg-white p-6 rounded-lg shadow flex-1 min-w-[320px] md:min-w-[400px]"
              >
                <h3 class="text-lg font-medium mb-4">Registration Analysis</h3>
                <div class="grid grid-cols-2 gap-4">
                  <!-- Total Entrants -->
                  <div class="bg-slate-50 rounded-lg p-3">
                    <div
                      class="text-xs text-stone-400 uppercase tracking-wide mb-1"
                    >
                      Total Entrants
                    </div>
                    <div class="text-2xl font-bold text-slate-800">
                      {event.competitiveness?.totalEntrants > 0
                        ? event.competitiveness.totalEntrants
                        : "Unknown"}
                    </div>
                  </div>

                  <!-- Ranked Entrants -->
                  <div class="bg-slate-50 rounded-lg p-3">
                    <div
                      class="text-xs text-stone-400 uppercase tracking-wide mb-1"
                    >
                      Ranked Runners
                    </div>
                    <div class="text-2xl font-bold text-slate-800">
                      {event.competitiveness?.rankedEntrants}
                    </div>
                  </div>
                </div>

                <!-- Field Size Meter -->
                {#if yearStats && yearStats.maxTotalEntrants > yearStats.minTotalEntrants}
                  {@const sizeRange =
                    yearStats.maxTotalEntrants - yearStats.minTotalEntrants}
                  {@const sizePosition = Math.max(
                    0,
                    Math.min(
                      100,
                      ((event.competitiveness.totalEntrants -
                        yearStats.minTotalEntrants) /
                        sizeRange) *
                        100,
                    ),
                  )}
                  <div class="mt-3">
                    <div class="flex justify-between items-end mb-1">
                      <span
                        class="text-[10px] font-bold uppercase tracking-wider text-slate-600"
                        >Field Size Meter</span
                      >
                    </div>
                    <div
                      class="h-2 w-full bg-slate-100 rounded-full relative overflow-visible"
                    >
                      <div
                        class="absolute inset-0 rounded-full bg-gradient-to-r from-slate-200 via-emerald-200 to-teal-300 opacity-60"
                      ></div>
                      <div
                        class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-slate-600 rounded-full shadow-sm z-10"
                        style="left: {sizePosition}%;"
                        title="This event: {event.competitiveness
                          .totalEntrants} entrants"
                      ></div>
                    </div>
                    <div
                      class="flex justify-between text-[9px] text-slate-300 mt-0.5 font-medium uppercase"
                    >
                      <span>Smallest ({yearStats.minTotalEntrants})</span>
                      <span>Largest ({yearStats.maxTotalEntrants})</span>
                    </div>
                  </div>
                {/if}

                {#if event.data && event.data.length > 0 && event.data.some((d: WaitlistSnapshot) => (d.count || 0) > 0)}
                  {@const last = event.data[event.data.length - 1]}
                  <div class="mt-4 pt-4 border-t border-stone-100">
                    <h4
                      class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3"
                    >
                      Waitlist
                    </h4>
                    <WaitlistStatsCard {event} lastSnapshot={last} />
                  </div>
                {/if}
              </div>
            {/if}
          {/each}

          <!-- Waitlist Trends Card (full width) -->
          {#if activeEvents.some((e: EnrichedPageEvent) => e.data && e.data.length > 1 && e.data.some((d: WaitlistSnapshot) => (d.count || 0) > 0))}
            <div class="bg-white p-6 rounded-lg shadow w-full">
              <h4
                class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3"
              >
                Waitlist Trends
              </h4>
              <WaitlistChart
                events={activeEvents.map((e: EnrichedPageEvent) => ({
                  title: e.title,
                  data: e.data || [],
                  velocityData: e.velocitySeries || [],
                  frontSeries: e.frontSeries || [],
                  medianSeries: e.medianSeries || [],
                  regression: e.regression,
                  waitlistProjection: e.waitlistProjection,
                }))}
                raceDate={race.date}
              />
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- In-page Ad -->
    <ins
      class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-1251836334060830"
      data-ad-slot="8468844777"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>

    {#if activeEvents.length === 0 && entrants.length === 0}
      <div
        class="p-12 text-center border-2 border-dashed border-stone-300 rounded-2xl bg-white/50 mb-8"
      >
        <p class="text-stone-500 text-lg">
          No data available for this category yet.
        </p>
      </div>
    {/if}

    <!-- Field Statistics (no waitlist but has entrants) -->
    {#if activeEvents.length === 0 && fieldCompetitiveness}
      <div class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium mb-4">Field Analysis</h3>
            <div class="border-b pb-4 last:border-0 last:pb-0">
              <FieldStrengthCard
                competitiveness={fieldCompetitiveness}
                {yearStats}
                eventTitle={events[0]?.title}
              />

              <FieldAnalysisPeers
                racesForYear={strongestFields}
                currentRaceId={String(events[0]?.id)}
                year={race.year}
              />
            </div>
          </div>

          <!-- Right Column: Entrant Stats -->
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-medium mb-4">Registration Analysis</h3>
            <div class="grid grid-cols-2 gap-4">
              <!-- Total Entrants -->
              <div class="bg-slate-50 rounded-lg p-3">
                <div
                  class="text-xs text-stone-400 uppercase tracking-wide mb-1"
                >
                  Total Entrants
                </div>
                <div class="text-2xl font-bold text-slate-800">
                  {fieldCompetitiveness.totalEntrants > 0
                    ? fieldCompetitiveness.totalEntrants
                    : "Unknown"}
                </div>
              </div>

              <!-- Ranked Entrants -->
              <div class="bg-slate-50 rounded-lg p-3">
                <div
                  class="text-xs text-stone-400 uppercase tracking-wide mb-1"
                >
                  Ranked Runners
                </div>
                <div class="text-2xl font-bold text-slate-800">
                  {fieldCompetitiveness.rankedEntrants}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Related Blog Posts -->
    {#if relatedPosts.length > 0}
      <div class="mb-8">
        <h2
          class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3"
        >
          <svg
            class="w-6 h-6 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          Related Posts
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each relatedPosts as post}
            <a
              href={post.relativeURL}
              class="group bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div class="p-6">
                <div
                  class="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2"
                >
                  {new Date(post.pubDate).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <h3
                  class="font-bold text-lg text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2"
                >
                  {post.title}
                </h3>
                <p class="text-sm text-slate-600 line-clamp-3">
                  {post.description}
                </p>
                {#if post.tags && post.tags.length > 0}
                  <div class="flex flex-wrap gap-1 mt-3">
                    {#each post.tags.slice(0, 3) as tag}
                      <span
                        class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded"
                        >{tag}</span
                      >
                    {/each}
                  </div>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    {#if entrants.length > 0}
      <div class="mb-12 bg-stone-50">
        <h2
          class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3"
        >
          <svg
            class="w-6 h-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
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
              {@render ParticipantList(
                topMen,
                "Top Men",
                "blue",
                showAllMen,
                () => (showAllMen = !showAllMen),
              )}
            </Tabs.Content>
            <Tabs.Content value="women">
              {@render ParticipantList(
                topWomen,
                "Top Women",
                "rose",
                showAllWomen,
                () => (showAllWomen = !showAllWomen),
              )}
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <!-- Desktop Grid -->
        <div class="hidden lg:grid grid-cols-2 gap-8">
          <div id="top-men">
            {@render ParticipantList(
              topMen,
              "Top Men",
              "blue",
              showAllMen,
              () => (showAllMen = !showAllMen),
            )}
          </div>
          <div id="top-women">
            {@render ParticipantList(
              topWomen,
              "Top Women",
              "rose",
              showAllWomen,
              () => (showAllWomen = !showAllWomen),
            )}
          </div>
        </div>
      </div>
    {/if}

    <!-- Full Waitlist Section -->
    {#if activeEvents.some((e: EnrichedPageEvent) => e.data && e.data.length > 0 && e.data[e.data.length - 1].applicants?.length > 0)}
      <div id="waitlist" class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each activeEvents as event}
            {#if event.data && event.data.length > 0}
              {@const last = event.data[event.data.length - 1]}
              {#if last.applicants && last.applicants.length > 0}
                <div class="mt-8">
                  <WaitlistTable
                    applicants={getWaitlistApplicants(
                      String(event.id),
                      last.applicants,
                    )}
                    eventId={String(event.id)}
                  />
                </div>
              {/if}
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
