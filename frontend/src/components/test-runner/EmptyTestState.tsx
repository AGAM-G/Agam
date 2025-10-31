import { FileCode } from 'lucide-react';

interface EmptyTestStateProps {
  onDiscoverTests: () => void;
  loading: boolean;
}

const EmptyTestState: React.FC<EmptyTestStateProps> = ({
  onDiscoverTests,
  loading,
}) => {
  return (
    <div className="text-center py-12">
      <FileCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No Test Cases Found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Click "Discover Tests" to scan your test directory and register all available tests.
      </p>
      <button
        onClick={onDiscoverTests}
        disabled={loading}
        className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <FileCode className="w-5 h-5" />
        <span>Discover Tests Now</span>
      </button>
    </div>
  );
};

export default EmptyTestState;

