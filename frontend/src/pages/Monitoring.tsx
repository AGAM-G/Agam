import { useState, useEffect } from 'react';
import { Header } from '../components/layout';
import { ActiveTests, SystemHealthDetailed, SystemAlerts } from '../components/monitoring';
import { api } from '../lib/api';
import { RefreshCw } from 'lucide-react';

const Monitoring = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTestsData, setActiveTestsData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [alertsData, setAlertsData] = useState<any>(null);

  const fetchMonitoringData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [activeTests, health, alerts] = await Promise.all([
        api.getActiveTests({ limit: 2 }),
        api.getSystemHealthDetailed(),
        api.getSystemAlerts(),
      ]);

      if (activeTests.success) {
        setActiveTestsData(activeTests.data);
      }

      if (health.success) {
        setHealthData(health.data);
      }

      if (alerts.success) {
        setAlertsData(alerts.data);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchMonitoringData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchMonitoringData(true);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
        <Header title="Monitoring" showActions={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading monitoring data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Monitoring" showActions={false} />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {/* Header with Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Real-Time Monitoring
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor test executions, system health, and alerts
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Active Tests (takes 2 columns on xl) */}
          <div className="xl:col-span-2 space-y-6">
            {activeTestsData && (
              <ActiveTests
                runningTests={activeTestsData.runningTests || []}
                lastCompletedRuns={activeTestsData.lastCompletedRuns || []}
                timestamp={activeTestsData.timestamp}
              />
            )}

            {alertsData && (
              <SystemAlerts alerts={alertsData.alerts || []} count={alertsData.count || 0} />
            )}
          </div>

          {/* Right Column - System Health */}
          <div className="xl:col-span-1">
            {healthData && <SystemHealthDetailed healthData={healthData} />}
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Auto-refreshing every 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
