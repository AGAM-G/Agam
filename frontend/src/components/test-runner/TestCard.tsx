import { Clock } from 'lucide-react';
import { getTestTypeColor } from '../../lib/utils';
import TestCardStatusIcon from './TestCardStatusIcon';
import TestCardActions from './TestCardActions';

interface ActiveTestRun {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  started_at: string;
}

interface TestFile {
  id: string;
  name: string;
  path: string;
  type: string;
  suite: string;
  status: string;
  testCases: any[];
}

interface TestCardProps {
  file: TestFile;
  activeRun?: ActiveTestRun;
  onRunTest: (file: TestFile) => void;
  onStopTest: (testRunId: string) => void;
  onViewDetails: (testRunId: string) => void;
}

const TestCard: React.FC<TestCardProps> = ({
  file,
  activeRun,
  onRunTest,
  onStopTest,
  onViewDetails,
}) => {
  const isRunning = activeRun?.status === 'running' || activeRun?.status === 'pending';
  const justCompleted = activeRun && (activeRun.status === 'passed' || activeRun.status === 'failed');

  const cardBorderClasses = isRunning
    ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
    : justCompleted
    ? activeRun.status === 'passed'
      ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
      : 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600';

  return (
    <div className={`border rounded-lg p-4 transition-all ${cardBorderClasses}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <TestCardStatusIcon
            isRunning={isRunning}
            justCompleted={!!justCompleted}
            status={activeRun?.status === 'passed' || activeRun?.status === 'failed' ? activeRun.status : undefined}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {file.suite}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
              {file.testCases?.length || 0} test case(s)
            </p>
            {isRunning && activeRun && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{activeRun.status === 'pending' ? 'Starting...' : 'Running...'}</span>
              </p>
            )}
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getTestTypeColor(
            file.type
          )}`}
        >
          {file.type}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <TestCardActions
          isRunning={isRunning}
          justCompleted={!!justCompleted}
          activeRun={activeRun}
          file={file}
          onRunTest={onRunTest}
          onStopTest={onStopTest}
          onViewDetails={onViewDetails}
        />
      </div>
    </div>
  );
};

export default TestCard;

