import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Header } from '../components/layout';
import { QuickActions, ServerStatus, SystemHealth, RecentTestRuns } from '../components/dashboard';
import { api } from '../lib/api';
import { calculateMetrics } from '../lib/analyticsCalculations';

interface DashboardMetrics {
  totalRuns: number;
  successRate: number;
  successRateChange: number;
  failedTests: number;
  avgDuration: number;
  totalTestsExecuted: number;
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

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const fetchDashboardData = async () => {
    try {
      const [healthRes, runsRes, allRunsRes] = await Promise.all([
        api.getSystemHealth(),
        api.getTestRuns({ limit: 5 }), // For recent test runs display
        api.getTestRuns({ limit: 500 }), // For metrics calculation
      ]);

      // Calculate metrics using shared calculation logic (same as Analytics page)
      if (allRunsRes.success) {
        const calculatedMetrics = calculateMetrics(allRunsRes.data, 7); // Last 7 days
        setMetrics(calculatedMetrics);
      }
      
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
        <ServerStatus onRefresh={fetchDashboardData} />

        {/* Dashboard Overview */}
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              title="Test Runs (7d)"
              value={metrics?.totalRuns || 0}
              change={0}
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
              change={0}
              icon={XCircle}
              color="bg-red-50 text-red-600"
            />
            <MetricCard
              title="Avg Duration"
              value={formatDuration(metrics?.avgDuration || 0)}
              change={0}
              icon={Clock}
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Recent Test Runs */}
          <RecentTestRuns
            recentRuns={recentRuns}
            onTestRunClick={(id) => navigate(`/test-results/${id}`)}
          />

          {/* System Health */}
          <SystemHealth systemHealth={systemHealth} />
        </div>

        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
