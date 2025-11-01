import { Play, Clock } from 'lucide-react';

interface TestRun {
  id: string;
  run_id: string;
  name: string;
  status: string;
  started_at: string;
  completed_at?: string;
  running_duration_seconds?: number;
  tests_passed: number;
  tests_failed: number;
  tests_pending: number;
  total_tests: number;
  user_name?: string;
}

interface ActiveTestsProps {
  runningTests: TestRun[];
  lastCompletedRuns: TestRun[];
  timestamp: string;
}

const ActiveTests = ({ runningTests, lastCompletedRuns, timestamp }: ActiveTestsProps) => {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Test Execution Status
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Updated: {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Running Tests */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Play className="w-4 h-4 text-blue-500" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Currently Running ({runningTests.length})
          </h4>
        </div>
        
        {runningTests.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
            No tests currently running
          </div>
        ) : (
          <div className="space-y-3">
            {runningTests.map((test) => (
              <div
                key={test.id}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {test.name}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ID: {test.run_id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Running
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDuration(test.running_duration_seconds || 0)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Progress: {test.tests_passed + test.tests_failed}/{test.total_tests}
                    </span>
                  </div>
                  {test.user_name && (
                    <span className="text-gray-500 dark:text-gray-400">
                      by {test.user_name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Completed Runs */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Last Completed Runs
        </h4>
        
        {lastCompletedRuns.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
            No completed runs yet
          </div>
        ) : (
          <div className="space-y-2">
            {lastCompletedRuns.map((test) => (
              <div
                key={test.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {test.name}
                    </h5>
                    <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                      <span>
                        {formatTimestamp(test.completed_at || test.started_at)}
                      </span>
                      <span>
                        ✓ {test.tests_passed} / ✗ {test.tests_failed}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      test.status === 'passed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : test.status === 'failed'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveTests;

