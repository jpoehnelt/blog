import type {
  Race,
  WaitlistSnapshot,
  Participant,
  RaceEventSummary,
  WaitlistHistory,
} from "@jpoehnelt/ultrasignup-scraper/types";

/**
 * Statistics about the competitiveness of a race field.
 */
export interface CompetitivenessStats {
  totalEntrants: number;
  rankedEntrants: number; // Runners with 5+ results
  insufficientResultsCount: number; // Runners with rank but <5 results
  unrankedCount: number; // Runners with no rank
  averageRank: number;
  medianRank: number;
  eliteCount: number; // 90+ rank
  strongCount: number; // 80-89.9 rank
  midPackCount: number; // 60-79.9 rank
  newcomerCount: number; // <60
  topRunners: { name: string; rank: number; location: string }[];
  rankDistribution: { label: string; count: number; percent: number }[];
  top20Rank: number | null;
  top20Average: number | null;
}

/**
 * Statistics about waitlist movement at different percentiles.
 */
export interface PercentileStats {
  percentile: number;
  position: number;
  velocity: number; // positions moved per day at this percentile
}

/**
 * Waitlist projection based on regression analysis.
 */
export interface WaitlistProjection {
  projectedCount: number;
  trendPoints: { date: string; count: number }[];
  r2: number;
}

/**
 * Regression analysis result for velocity trends.
 */
export interface RegressionResult {
  coefficients: number[];
  r2: number;
  equation: string;
  predict: (x: number) => number;
  trendPoints: { dayIndex: number; velocity: number }[];
  projectedVelocityAtRace: number | null;
  projectedPositionChange: number | null;
}

/**
 * Page event type (from +page.svelte).
 */
export interface PageEvent extends Omit<RaceEventSummary, "entrants"> {
  data: WaitlistHistory | null;
  entrants: Participant[] | null;
}

/**
 * Enriched event with computed analytics properties.
 */
export interface EnrichedPageEvent extends PageEvent {
  velocity: number | null;
  velocitySeries: { date: string; velocity: number }[];
  frontSeries: { date: string; velocity: number }[];
  medianSeries: { date: string; velocity: number }[];
  regression: RegressionResult | null;
  waitlistProjection?: WaitlistProjection | null;
  percentileStats: PercentileStats[];
  competitiveness: CompetitivenessStats | null;
}

/**
 * Year-wide statistics for race comparisons (from layout.server.ts).
 */
export interface YearStats {
  averageTop20Rank: number;
  minTop20Rank: number;
  maxTop20Rank: number;
  averageEliteCount: number;
  averageElitePercent: number;
  minTotalEntrants: number;
  maxTotalEntrants: number;
  averageTotalEntrants: number;
}

/**
 * Race with competitiveness data for comparison lists.
 */
export interface RaceWithCompetitiveness {
  id: string | number;
  raceId?: number;
  eventId?: number;
  title: string;
  slug: string;
  date: string | Date;
  competitiveness: {
    top20Rank: number;
    totalEntrants: number;
  };
}
