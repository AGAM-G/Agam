/**
 * Shared analytics calculation utilities
 * Used by both Dashboard and Analytics pages to ensure consistent metrics
 */

export interface TestRun {
  id: string;
  run_id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration: number;
  started_at: string;
  completed_at?: string;
  tests_passed: number;
  tests_failed: number;
  tests_pending: number;
  total_tests: number;
}

export interface DailyStats {
  date: string;
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  passRate: number;
  avgDuration: number;
}

export interface MetricsResult {
  totalRuns: number;
  successRate: number;
  successRateChange: number;
  failedTests: number;
  avgDuration: number; // in milliseconds
  totalTestsExecuted: number;
}

export interface AnalyticsData {
  totalRuns: number;
  overallPassRate: number;
  avgDuration: number;
  totalTestsExecuted: number;
  passRateTrend: number; // percentage change from previous period
  dailyStats: DailyStats[];
  slowestTests: TestRun[];
}

/**
 * Calculate metrics for a given time period
 * @param runs - All test runs to analyze
 * @param days - Number of days to look back (default: 7)
 * @returns Calculated metrics with trend comparisons
 */
export const calculateMetrics = (runs: TestRun[], days: number = 7): MetricsResult => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousCutoffDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

  // Filter runs for current period (only completed tests)
  const currentPeriodRuns = runs.filter((run) => {
    const runDate = new Date(run.started_at);
    return runDate >= cutoffDate && (run.status === 'passed' || run.status === 'failed');
  });

  // Filter runs for previous period (for comparison)
  const previousPeriodRuns = runs.filter((run) => {
    const runDate = new Date(run.started_at);
    return (
      runDate >= previousCutoffDate &&
      runDate < cutoffDate &&
      (run.status === 'passed' || run.status === 'failed')
    );
  });

  // Calculate current period stats
  const totalRuns = currentPeriodRuns.length;
  const passedRuns = currentPeriodRuns.filter((run) => run.status === 'passed').length;
  const failedTests = currentPeriodRuns.filter((run) => run.status === 'failed').length;
  const successRate = totalRuns > 0 ? (passedRuns / totalRuns) * 100 : 0;
  const avgDuration =
    totalRuns > 0
      ? currentPeriodRuns.reduce((sum, run) => sum + run.duration, 0) / totalRuns
      : 0;
  const totalTestsExecuted = currentPeriodRuns.reduce(
    (sum, run) => sum + run.total_tests,
    0
  );

  // Calculate previous period stats for trend
  const prevTotalRuns = previousPeriodRuns.length;
  const prevPassedRuns = previousPeriodRuns.filter((run) => run.status === 'passed').length;
  const prevSuccessRate = prevTotalRuns > 0 ? (prevPassedRuns / prevTotalRuns) * 100 : 0;

  // Calculate success rate change (percentage point change, not percentage of percentage)
  const successRateChange = successRate - prevSuccessRate;

  return {
    totalRuns,
    successRate: Math.round(successRate),
    successRateChange: Math.round(successRateChange),
    failedTests,
    avgDuration,
    totalTestsExecuted,
  };
};

/**
 * Calculate comprehensive analytics including daily trends and slowest tests
 * This function builds on top of calculateMetrics to add chart data
 * @param runs - All test runs to analyze
 * @param days - Number of days to look back
 * @returns Complete analytics data including metrics, daily stats, and slowest tests
 */
export const calculateAnalytics = (runs: TestRun[], days: number): AnalyticsData => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Use shared calculation logic (same as Dashboard)
  // This ensures accuracy and consistency across the application
  const metrics = calculateMetrics(runs, days);

  // Filter runs for current period for additional analytics
  const currentPeriodRuns = runs.filter((run) => {
    const runDate = new Date(run.started_at);
    return runDate >= cutoffDate && (run.status === 'passed' || run.status === 'failed');
  });

  // Group runs by day for daily stats (used by charts)
  // Create a map with one entry per day to ensure all days are represented
  const dailyMap = new Map<string, TestRun[]>();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = date.toISOString().split('T')[0];
    dailyMap.set(dateKey, []);
  }

  // Distribute test runs into their respective days
  currentPeriodRuns.forEach((run) => {
    const dateKey = run.started_at.split('T')[0];
    if (dailyMap.has(dateKey)) {
      dailyMap.get(dateKey)!.push(run);
    }
  });

  // Convert to daily stats array with accurate calculations per day
  const dailyStats: DailyStats[] = Array.from(dailyMap.entries())
    .map(([date, dayRuns]) => {
      const totalRuns = dayRuns.length;
      const passedRuns = dayRuns.filter((run) => run.status === 'passed').length;
      const failedRuns = dayRuns.filter((run) => run.status === 'failed').length;
      const passRate = totalRuns > 0 ? (passedRuns / totalRuns) * 100 : 0;
      const avgDuration =
        totalRuns > 0 ? dayRuns.reduce((sum, run) => sum + run.duration, 0) / totalRuns : 0;

      return {
        date,
        totalRuns,
        passedRuns,
        failedRuns,
        passRate,
        avgDuration,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Get slowest tests (top 10) for performance analysis
  const slowestTests = [...currentPeriodRuns]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  // Return complete analytics data using metrics from shared calculation
  return {
    totalRuns: metrics.totalRuns,
    overallPassRate: metrics.successRate,
    avgDuration: metrics.avgDuration,
    totalTestsExecuted: metrics.totalTestsExecuted,
    passRateTrend: metrics.successRateChange,
    dailyStats,
    slowestTests,
  };
};
