import { useNavigate } from 'react-router-dom';
import { Play, Activity, TrendingUp } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/test-runner')}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
              <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Run Smoke Tests
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Execute critical path tests
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/test-runner', { state: { filter: 'LOAD' } })}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Load Test</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Start performance testing
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/analytics')}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">View Analytics</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Check test trends</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;

