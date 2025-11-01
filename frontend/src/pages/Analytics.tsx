import { useEffect, useState } from 'react';
import { Header } from '../components/layout';
import { BarChart3 } from 'lucide-react';
import { api } from '../lib/api';
import { calculateAnalytics, type TestRun, type AnalyticsData } from '../lib/analyticsCalculations';
import {
  AnalyticsHeader,
  StatsCards,
  PassRateTrendChart,
  SlowestTestsTable,
  ExecutionVolumeChart,
} from '../components/analytics';

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastCheckTimestamp, setLastCheckTimestamp] = useState<number>(Date.now());

  /**
   * CACHING STRATEGY:
   * - Analytics are saved to localStorage after first calculation
   * - On subsequent visits, loads instantly from cache (no API call)
   * - Cache automatically expires after 5 minutes (to reflect new test runs)
   * - Only recalculates when:
   *   1. localStorage is cleared/reset
   *   2. User clicks the refresh button (force refresh)
   *   3. User changes time range (7/14/30 days)
   *   4. Cache is older than 5 minutes
   *   5. New test runs complete (cache is cleared)
   * - Each time range has its own cache key
   */
  const fetchAnalytics = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Try to load from localStorage first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(`analytics_${timeRange}_days`);
        const cacheTimestamp = localStorage.getItem(`analytics_${timeRange}_days_timestamp`);
        
        if (cachedData && cacheTimestamp) {
          try {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds
            
            // Check if cache is still fresh (less than 5 minutes old)
            if (cacheAge < MAX_CACHE_AGE) {
              const parsed = JSON.parse(cachedData);
              setAnalytics(parsed);
              setIsFromCache(true);
              setLastCheckTimestamp(parseInt(cacheTimestamp)); // Set to cache creation time
              setLoading(false);
              const ageMinutes = Math.floor(cacheAge / 60000);
              console.log(`✅ Loaded analytics from cache for ${timeRange} days (${ageMinutes}m old)`);
              return;
            } else {
              console.log(`🔄 Cache expired (${Math.floor(cacheAge / 60000)}m old), fetching fresh data`);
            }
          } catch (e) {
            console.warn('Failed to parse cached analytics, fetching fresh data');
          }
        }
      }

      // Fetch test runs (get more data for better analytics)
      const response = await api.getTestRuns({ limit: 500 });
      
      if (response.success) {
        const allRuns = response.data as TestRun[];
        const calculatedAnalytics = calculateAnalytics(allRuns, timeRange);
        setAnalytics(calculatedAnalytics);
        setIsFromCache(false);
        setLastCheckTimestamp(Date.now()); // Update timestamp after fetching fresh data
        
        // Save to localStorage for future use (with timestamp)
        try {
          localStorage.setItem(
            `analytics_${timeRange}_days`,
            JSON.stringify(calculatedAnalytics)
          );
          localStorage.setItem(
            `analytics_${timeRange}_days_timestamp`,
            Date.now().toString()
          );
          console.log(`💾 Saved analytics to cache for ${timeRange} days`);
        } catch (e) {
          console.warn('Failed to cache analytics:', e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  /**
   * AUTO-REFRESH DETECTION:
   * Polls for recent test completions and auto-refreshes analytics
   * This ensures the page shows current data even if user is already viewing it
   */
  useEffect(() => {
    const checkForTestCompletions = async () => {
      try {
        // Fetch only recent test runs (lightweight API call)
        const response = await api.getTestRuns({ limit: 10 });
        
        if (response.success && response.data.length > 0) {
          // Check if any tests completed after our last check
          const hasRecentCompletions = response.data.some((run: TestRun) => {
            if (run.status === 'passed' || run.status === 'failed') {
              const completedTime = new Date(run.completed_at || run.started_at).getTime();
              // Test completed after our last check
              return completedTime > lastCheckTimestamp;
            }
            return false;
          });

          if (hasRecentCompletions) {
            console.log('🔄 Detected recent test completions, refreshing analytics...');
            setIsFromCache(false); // Clear cache indicator during refresh
            await fetchAnalytics(true); // Force refresh to get latest data
            setLastCheckTimestamp(Date.now()); // Update check timestamp
          }
        }
      } catch (error) {
        console.error('Failed to check for test completions:', error);
      }
    };

    // Check every 5 seconds for test completions
    const interval = setInterval(checkForTestCompletions, 5000);

    return () => clearInterval(interval);
  }, [lastCheckTimestamp, timeRange]); // Re-run when timestamp or timeRange changes

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
        <Header title="Analytics" showActions={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Analytics" showActions={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
              Run some tests to see analytics
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Analytics" onRefresh={() => fetchAnalytics(true)} />

      <div className="flex-1 overflow-hidden px-8 pt-4 pb-4 space-y-4 flex flex-col">
        {/* Time Range Selector */}
        <AnalyticsHeader
          isFromCache={isFromCache}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        {/* Stats Cards */}
        <StatsCards
          totalRuns={analytics.totalRuns}
          overallPassRate={analytics.overallPassRate}
          passRateTrend={analytics.passRateTrend}
          avgDuration={analytics.avgDuration}
          totalTestsExecuted={analytics.totalTestsExecuted}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Pass Rate Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Pass Rate Trend
            </h3>
            <PassRateTrendChart data={analytics.dailyStats} />
          </div>

          {/* Test Execution Volume Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Test Execution Volume
            </h3>
            <ExecutionVolumeChart data={analytics.dailyStats} />
          </div>
        </div>

        {/* Slowest Tests Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Slowest Test Runs
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Top 10 longest running tests in the selected period
            </p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <SlowestTestsTable tests={analytics.slowestTests} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Utility function to clear analytics cache
 * Call this after test runs complete to ensure fresh data on next analytics page visit
 */
export const clearAnalyticsCache = () => {
  try {
    // Clear all analytics cache entries (7, 14, and 30 days)
    [7, 14, 30].forEach((days) => {
      localStorage.removeItem(`analytics_${days}_days`);
      localStorage.removeItem(`analytics_${days}_days_timestamp`);
    });
    console.log('🧹 Cleared analytics cache');
  } catch (e) {
    console.warn('Failed to clear analytics cache:', e);
  }
};

export default Analytics;
