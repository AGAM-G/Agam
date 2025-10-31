import { Activity, Target, Clock, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardsProps {
  totalRuns: number;
  overallPassRate: number;
  passRateTrend: number;
  avgDuration: number;
  totalTestsExecuted: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalRuns,
  overallPassRate,
  passRateTrend,
  avgDuration,
  totalTestsExecuted,
}) => {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Test Runs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Test Runs</h3>
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalRuns}</p>
        </div>
      </div>

      {/* Overall Pass Rate */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-300">Pass Rate</h3>
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{overallPassRate}%</p>
            {passRateTrend !== 0 && (
              <p
                className={`text-xs mt-0.5 flex items-center space-x-1 ${
                  passRateTrend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {passRateTrend > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(Math.round(passRateTrend))}% from previous</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Average Duration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-300">Avg Duration</h3>
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatDuration(avgDuration)}
          </p>
        </div>
      </div>

      {/* Total Tests Executed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-300">Tests Executed</h3>
          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalTestsExecuted}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;

