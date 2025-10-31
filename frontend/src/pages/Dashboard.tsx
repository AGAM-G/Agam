import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Header from '../components/layout/Header';
import QuickActions from '../components/QuickActions';
import { api } from '../lib/api';
import { getTimeAgo, formatDuration } from '../lib/utils';

interface DashboardMetrics {
  totalTests: number;
  totalTestsChange: number;
  successRate: number;
  successRateChange: number;
  failedTests: number;
  failedTestsChange: number;
  avgDuration: number;
  avgDurationChange: number;
}

interface SystemHealth {
  status: string;
  testRunners: { active: number; total: number };
  database: { available: number };
  runningTests: number;
}

interface TestRun {
  id: string;
  run_id: string;
  name: string;
  status: string;
  duration: number;
  started_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [recentRuns, setRecentRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, healthRes, runsRes] = await Promise.all([
        api.getDashboardMetrics(),
        api.getSystemHealth(),
        api.getTestRuns({ limit: 5 }),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.data);
      if (healthRes.success) setSystemHealth(healthRes.data);
      if (runsRes.success) setRecentRuns(runsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-300">{title}</h3>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change !== 0 && (
            <p
              className={`text-xs mt-0.5 ${
                change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {change > 0 ? '+' : ''}
              {change}% from last week
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header
        title="Dashboard"
        onRefresh={fetchDashboardData}
        onNewTest={() => navigate('/test-runner')}
      />

      <div className="flex-1 overflow-y-auto px-8 pt-4 pb-4 space-y-4">
        {/* Server Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Server Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Connected • Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-200"
            >
              Check
            </button>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              title="Total Tests"
              value={metrics?.totalTests || 0}
              change={metrics?.totalTestsChange || 0}
              icon={Target}
              color="bg-blue-50 text-blue-600"
            />
            <MetricCard
              title="Success Rate"
              value={`${metrics?.successRate || 0}%`}
              change={metrics?.successRateChange || 0}
              icon={CheckCircle}
              color="bg-green-50 text-green-600"
            />
            <MetricCard
              title="Failed Tests"
              value={metrics?.failedTests || 0}
              change={metrics?.failedTestsChange || 0}
              icon={XCircle}
              color="bg-red-50 text-red-600"
            />
            <MetricCard
              title="Avg Duration"
              value={`${metrics?.avgDuration || 0}s`}
              change={metrics?.avgDurationChange || 0}
              icon={Clock}
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Recent Test Runs */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Test Runs
              </h3>
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                Live Data
              </span>
            </div>

            <div className="space-y-2">
              {recentRuns.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                  No test runs yet
                </p>
              ) : (
                recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/test-results/${run.id}`)}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{run.name || run.run_id}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getTimeAgo(run.started_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {formatDuration(run.duration / 1000)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          run.status === 'passed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : run.status === 'failed'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}
                      >
                        {run.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                System Health
              </h3>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {systemHealth?.status || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Test Runners</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {systemHealth?.testRunners.active || 0}/
                    {systemHealth?.testRunners.total || 0} active
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{
                      width: systemHealth
                        ? `${
                            (systemHealth.testRunners.active /
                              systemHealth.testRunners.total) *
                            100
                          }%`
                        : '0%',
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Database</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {systemHealth?.database.available || 0}% available
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{
                      width: `${systemHealth?.database.available || 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Running Tests</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {systemHealth?.runningTests || 0} active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
