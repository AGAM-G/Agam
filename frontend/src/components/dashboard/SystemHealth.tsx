interface SystemHealthProps {
  systemHealth: {
    status: string;
    testRunners: { active: number; total: number };
    database: { available: number };
    runningTests: number;
  } | null;
}

const SystemHealth = ({ systemHealth }: SystemHealthProps) => {
  return (
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
  );
};

export default SystemHealth;

