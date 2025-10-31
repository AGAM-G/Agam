import { CheckCircle, XCircle } from 'lucide-react';

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

interface SlowestTestsTableProps {
  tests: TestRun[];
}

const SlowestTestsTable: React.FC<SlowestTestsTableProps> = ({ tests }) => {
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (tests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No test data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tests.map((test, index) => (
        <div
          key={test.id}
          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {test.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {test.total_tests} test case(s) • {formatDate(test.started_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {test.status === 'passed' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDuration(test.duration)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlowestTestsTable;

