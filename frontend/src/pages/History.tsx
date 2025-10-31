import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Calendar,
  Timer,
  FileCode,
  ChevronRight,
} from 'lucide-react';
import { Header } from '../components/layout';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';

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
  user_name?: string;
}

const History = () => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const fetchTestRuns = async () => {
    setLoading(true);
    try {
      const response = await api.getTestRuns({ limit: 100 });
      if (response.success) {
        setTestRuns(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch test runs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestRuns();
  }, []);

  const filteredRuns = testRuns.filter((run) => {
    if (filterStatus === 'all') return true;
    return run.status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Play className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      passed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      failed: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      running: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      pending: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getSuccessRate = (run: TestRun) => {
    if (run.total_tests === 0) return 0;
    return Math.round((run.tests_passed / run.total_tests) * 100);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Test History" onRefresh={fetchTestRuns} />

      <div className="flex-1 overflow-y-auto px-8 pt-4 pb-4 space-y-4">
        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by status:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredRuns.length} of {testRuns.length} run(s)
            </div>
          </div>
        </div>

        {/* Test Runs List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Test Execution History
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  View all past test runs and their results
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredRuns.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Test Runs Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {filterStatus === 'all'
                    ? 'Run some tests to see their history here'
                    : `No test runs with status "${filterStatus}"`}
                </p>
                <button
                  onClick={() => navigate('/test-runner')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Go to Test Runner</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRuns.map((run) => (
                  <div
                    key={run.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/test-results?runId=${run.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {getStatusIcon(run.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {run.name}
                            </h3>
                            {getStatusBadge(run.status)}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Run ID: {run.run_id}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <FileCode className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Total Tests
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {run.total_tests}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Passed</p>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            {run.tests_passed}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {run.tests_failed}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Timer className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Duration
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatDuration(run.duration)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(run.started_at)}</span>
                        </div>
                        {run.user_name && (
                          <div className="flex items-center space-x-1">
                            <span>by {run.user_name}</span>
                          </div>
                        )}
                      </div>

                      {run.status === 'passed' || run.status === 'failed' ? (
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Success Rate:
                          </div>
                          <div
                            className={`text-sm font-semibold ${
                              getSuccessRate(run) >= 80
                                ? 'text-green-600 dark:text-green-400'
                                : getSuccessRate(run) >= 50
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {getSuccessRate(run)}%
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
