import { CheckCircle } from 'lucide-react';

interface ServerStatusProps {
  onRefresh: () => void;
}

const ServerStatus = ({ onRefresh }: ServerStatusProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Server Status</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Connected • Last checked: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-200"
        >
          Check
        </button>
      </div>
    </div>
  );
};

export default ServerStatus;