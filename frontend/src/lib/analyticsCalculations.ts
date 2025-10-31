/**
 * Shared analytics calculation utilities
 * Used by both Dashboard and Analytics pages to ensure consistent metrics
 */

interface TestRun {
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

interface MetricsResult {
  totalRuns: number;
  successRate: number;
  successRateChange: number;
  failedTests: number;
  avgDuration: number; // in milliseconds
  totalTestsExecuted: number;
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

