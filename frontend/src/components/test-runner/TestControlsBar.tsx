import { Search, FileCode, RefreshCw } from 'lucide-react';

interface TestControlsBarProps {
  onDiscoverTests: () => void;
  onRefresh: () => void;
  onCleanup: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterChange: (value: string) => void;
  loading: boolean;
}

const TestControlsBar: React.FC<TestControlsBarProps> = ({
  onDiscoverTests,
  onRefresh,
  onCleanup,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  loading,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onDiscoverTests}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FileCode className="w-4 h-4" />
            <span>Discover Tests</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onCleanup}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cleanup DB</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search test cases by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-200"
        >
          <option>All Types</option>
          <option>API</option>
          <option>E2E</option>
          <option>LOAD</option>
          <option>UI</option>
        </select>
      </div>
    </div>
  );
};

export default TestControlsBar;

