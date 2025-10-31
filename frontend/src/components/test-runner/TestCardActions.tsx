import { Play, Eye, StopCircle } from 'lucide-react';

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

interface TestCardActionsProps {
  isRunning: boolean;
  justCompleted: boolean;
  activeRun?: ActiveTestRun;
  file: TestFile;
  onRunTest: (file: TestFile) => void;
  onStopTest: (testRunId: string) => void;
  onViewDetails: (testRunId: string) => void;
}

const TestCardActions: React.FC<TestCardActionsProps> = ({
  isRunning,
  justCompleted,
  activeRun,
  file,
  onRunTest,
  onStopTest,
  onViewDetails,
}) => {
  if (isRunning && activeRun) {
    // Running state: Show View Details and Stop buttons
    return (
      <div className="flex items-center space-x-2 w-full">
        <button
          onClick={() => onViewDetails(activeRun.id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
        <button
          onClick={() => onStopTest(activeRun.id)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <StopCircle className="w-4 h-4" />
          <span>Stop</span>
        </button>
      </div>
    );
  }

  if (justCompleted && activeRun) {
    // Just completed: Show result and View Details
    return (
      <div className="flex items-center justify-between w-full">
        <button
          onClick={() => onViewDetails(activeRun.id)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>View Results</span>
        </button>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            activeRun.status === 'passed'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          {activeRun.status}
        </span>
      </div>
    );
  }

  // Normal state: Show Run button
  return (
    <>
      <button
        onClick={() => onRunTest(file)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Play className="w-4 h-4" />
        <span>Run Tests</span>
      </button>
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          file.status === 'passed'
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : file.status === 'failed'
            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
        }`}
      >
        {file.status}
      </span>
    </>
  );
};

export default TestCardActions;

