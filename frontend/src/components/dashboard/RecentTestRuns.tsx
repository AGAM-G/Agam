import { getTimeAgo, formatDuration } from '../../lib/utils';

interface TestRun {
  id: string;
  run_id: string;
  name: string;
  status: string;
  duration: number;
  started_at: string;
}

interface RecentTestRunsProps {
  recentRuns: TestRun[];
  onTestRunClick: (id: string) => void;
}

const RecentTestRuns = ({ recentRuns, onTestRunClick }: RecentTestRunsProps) => {
  return (
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
              onClick={() => onTestRunClick(run.id)}
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
  );
};

export default RecentTestRuns;

