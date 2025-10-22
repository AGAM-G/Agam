import { useEffect, useState } from 'react';
import { Search, Download, Filter, Clock, FileCode } from 'lucide-react';
import Header from '../components/layout/Header';
import { api } from '../lib/api';
import { getStatusColor, getTestTypeColor, formatDate } from '../lib/utils';

interface TestFile {
  id: string;
  name: string;
  path: string;
  type: string;
  suite: string;
  status: string;
  modified_at: string;
  testCases: any[];
}

const TestResults = () => {
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Status');

  const fetchTestResults = async () => {
    setLoading(true);
    try {
      const [filesRes, runsRes] = await Promise.all([
        api.getTestFiles(),
        api.getTestRuns({ limit: 10 }),
      ]);

      if (filesRes.success) setTestFiles(filesRes.data);
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
    pending: testRuns.filter((r) => r.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Test Results" onRefresh={fetchTestResults} />

      <div className="p-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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

        {/* Test Files */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test Files</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : testFiles.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Test Files Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">No test files available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-750 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FileCode className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {file.name}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getTestTypeColor(
                                file.type
                              )}`}
                            >
                              {file.type}
                            </span>
                          </div>
                          <div className="ml-8 space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Suite: {file.suite}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Path: {file.path}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Modified: {formatDate(file.modified_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              file.status
                            )}`}
                          >
                            {file.status}
                          </span>
                          <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
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

export default TestResults;
