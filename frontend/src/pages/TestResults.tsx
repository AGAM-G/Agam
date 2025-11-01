import { useEffect, useState } from 'react';
import { Search, Download, Filter, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Header } from '../components/layout';
import TestDetailsModal from '../components/TestDetailsModal';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';

const TestResults = () => {
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedTestRunId, setSelectedTestRunId] = useState<string | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [testRunIdToStop, setTestRunIdToStop] = useState<string | null>(null);

  const fetchTestResults = async () => {
    setLoading(true);
    try {
      const runsRes = await api.getTestRuns({ limit: 10 });

      if (runsRes.success) setTestRuns(runsRes.data);
    } catch (error) {
      console.error('Failed to fetch test results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestResults();
  }, []);

  const stats = {
    passed: testRuns.filter((r) => r.status === 'passed').length,
    failed: testRuns.filter((r) => r.status === 'failed').length,
    totalRuns: testRuns.length,
    pending: testRuns.filter((r) => r.status === 'pending' || r.status === 'running').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
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

  const handleStopTest = (testRunId: string) => {
    setTestRunIdToStop(testRunId);
    setShowStopConfirm(true);
  };

  const handleConfirmStop = async () => {
    if (!testRunIdToStop) return;

    try {
      await api.stopTestRun(testRunIdToStop);
      fetchTestResults(); // Refresh the list
      setSelectedTestRunId(null); // Close the modal
      setTestRunIdToStop(null);
    } catch (error) {
      console.error('Error stopping test run:', error);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Test Results" onRefresh={fetchTestResults} />

      <div className="flex-1 overflow-hidden px-8 pt-4 pb-4 space-y-4 flex flex-col">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search test results..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Status</option>
              <option>Passed</option>
              <option>Failed</option>
              <option>Pending</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="w-6 h-6 text-green-600 dark:text-green-400 font-bold flex items-center justify-center">
                  ✓
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Passed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.passed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <div className="w-6 h-6 text-red-600 dark:text-red-400 font-bold flex items-center justify-center">
                  ✕
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Failed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Runs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRuns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Test Runs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Test Runs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Latest {testRuns.length} test executions
            </p>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : testRuns.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Test Runs Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Run some tests to see results here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {testRuns.map((run) => (
                  <div
                    key={run.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
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
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {run.total_tests}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Passed</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {run.tests_passed}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {run.tests_failed}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {formatDuration(run.duration)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(run.started_at)}
                      </p>
                      <button
                        onClick={() => setSelectedTestRunId(run.id)}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Test Details Modal */}
        {selectedTestRunId && (
          <TestDetailsModal
            testRunId={selectedTestRunId}
            onClose={() => setSelectedTestRunId(null)}
            onStop={handleStopTest}
          />
        )}

        {/* Stop Confirmation Modal */}
        <ConfirmModal
          isOpen={showStopConfirm}
          onConfirm={handleConfirmStop}
          onCancel={() => {
            setShowStopConfirm(false);
            setTestRunIdToStop(null);
          }}
          title="Stop Test Run"
          message="Are you sure you want to stop this test run? This will terminate all running tests immediately."
          confirmText="Stop Test"
          cancelText="Cancel"
          type="warning"
        />
      </div>
    </div>
  );
};

export default TestResults;
