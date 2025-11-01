import { Server, Database, Globe, Calendar } from 'lucide-react';

interface SystemHealthProps {
  healthData: {
    overall: string;
    timestamp: string;
    services: {
      backend?: {
        status: string;
        uptime: number;
        memory: {
          used: number;
          total: number;
          unit: string;
        };
      };
      database?: {
        status: string;
        responseTime: number;
        stats?: {
          running_tests: number;
          total_test_cases: number;
          active_schedules: number;
        };
      };
      scheduler?: {
        status: string;
        checkInterval: string;
      };
      frontend?: {
        status: string;
        note?: string;
      };
    };
  };
}

const SystemHealthDetailed = ({ healthData }: SystemHealthProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'unhealthy':
      case 'stopped':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          System Health
        </h3>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
            healthData.overall
          )}`}
        >
          {healthData.overall.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backend Service */}
        {healthData.services.backend && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Backend
                </h4>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                  healthData.services.backend.status
                )}`}
              >
                {healthData.services.backend.status}
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-medium">
                  {formatUptime(healthData.services.backend.uptime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className="font-medium">
                  {healthData.services.backend.memory.used}/
                  {healthData.services.backend.memory.total}{' '}
                  {healthData.services.backend.memory.unit}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Database Service */}
        {healthData.services.database && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Database
                </h4>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                  healthData.services.database.status
                )}`}
              >
                {healthData.services.database.status}
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span className="font-medium">{healthData.services.database.responseTime}ms</span>
              </div>
              {healthData.services.database.stats && (
                <>
                  <div className="flex justify-between">
                    <span>Test Cases:</span>
                    <span className="font-medium">
                      {healthData.services.database.stats.total_test_cases}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Schedules:</span>
                    <span className="font-medium">
                      {healthData.services.database.stats.active_schedules}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Scheduler Service */}
        {healthData.services.scheduler && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Test Scheduler
                </h4>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                  healthData.services.scheduler.status
                )}`}
              >
                {healthData.services.scheduler.status}
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Check Interval:</span>
                <span className="font-medium">
                  {healthData.services.scheduler.checkInterval}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Frontend Service */}
        {healthData.services.frontend && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Frontend
                </h4>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                  healthData.services.frontend.status
                )}`}
              >
                {healthData.services.frontend.status}
              </span>
            </div>
            {healthData.services.frontend.note && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {healthData.services.frontend.note}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealthDetailed;

