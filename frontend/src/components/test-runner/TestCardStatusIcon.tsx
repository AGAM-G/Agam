import { Loader2, CheckCircle, XCircle, FileCode } from 'lucide-react';

interface TestCardStatusIconProps {
  isRunning: boolean;
  justCompleted: boolean;
  status?: 'passed' | 'failed';
}

const TestCardStatusIcon: React.FC<TestCardStatusIconProps> = ({
  isRunning,
  justCompleted,
  status,
}) => {
  const iconClasses = isRunning
    ? 'bg-blue-100 dark:bg-blue-800'
    : justCompleted && status === 'passed'
    ? 'bg-green-100 dark:bg-green-800'
    : justCompleted && status === 'failed'
    ? 'bg-red-100 dark:bg-red-800'
    : 'bg-gray-100 dark:bg-gray-700';

  return (
    <div className={`p-2 rounded-lg ${iconClasses}`}>
      {isRunning ? (
        <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
      ) : justCompleted && status === 'passed' ? (
        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
      ) : justCompleted && status === 'failed' ? (
        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
      ) : (
        <FileCode className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      )}
    </div>
  );
};

export default TestCardStatusIcon;

