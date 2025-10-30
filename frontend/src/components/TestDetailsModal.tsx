import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Clock, Loader2, FileCode, Timer } from 'lucide-react';
import { api } from '../lib/api';

interface TestDetailsModalProps {
  testRunId: string;
  onClose: () => void;
  onStop?: (testRunId: string) => void;
}

interface TestRunDetails {
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
  results: Array<{
    id: string;
    test_name: string;
    status: string;
    duration: number;
    error?: string;
  }>;
}

const TestDetailsModal = ({ testRunId, onClose, onStop }: TestDetailsModalProps) => {
  const [testRun, setTestRun] = useState<TestRunDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTestRunDetails = async () => {
    try {
      const response = await api.getTestRunById(testRunId);
      if (response.success) {
        setTestRun(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch test run details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestRunDetails();

    // Poll for updates every 2 seconds if test is running
    const interval = setInterval(() => {
      if (testRun?.status === 'running' || testRun?.status === 'pending') {
        fetchTestRunDetails();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [testRunId, testRun?.status]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-4xl w-full mx-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!testRun) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(testRun.status)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {testRun.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Run ID: {testRun.run_id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {testRun.status === 'pending' ? 'Tests Pending' : 
                 testRun.status === 'running' ? 'Tests Running' :
                 testRun.status === 'passed' ? 'Tests Passed' : 'Tests Failed'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {testRun.completed_at 
                  ? `Completed in ${formatDuration(testRun.duration)}`
                  : 'In progress...'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {testRun.tests_passed}/{testRun.total_tests}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tests Passed</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FileCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {testRun.total_tests}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Tests</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {testRun.tests_passed}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Passed</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {testRun.tests_failed}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Failed</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {testRun.tests_pending}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
            </div>
          </div>
        </div>

        {/* Individual Test Results */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <FileCode className="w-5 h-5 mr-2" />
            Individual Test Results
          </h3>

          {testRun.results && testRun.results.length > 0 ? (
            <div className="space-y-3">
              {testRun.results.map((result) => (
                <div
                  key={result.id}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {result.test_name}
                        </h4>
                        {result.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {result.duration > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Timer className="w-4 h-4" />
                          <span>{formatDuration(result.duration)}</span>
                        </div>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>Waiting for test results...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Started: {new Date(testRun.started_at).toLocaleString()}
            </div>
            <div className="flex items-center space-x-3">
              {(testRun.status === 'running' || testRun.status === 'pending') && onStop && (
                <button
                  onClick={() => {
                    onStop(testRunId);
                    onClose();
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Stop Test
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetailsModal;

