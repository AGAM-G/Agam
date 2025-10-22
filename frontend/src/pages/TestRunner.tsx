import { useEffect, useState } from 'react';
import {
  Search,
  Play,
  Settings as SettingsIcon,
  RefreshCw,
  FileCode,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { api } from '../lib/api';
import { getTestTypeColor } from '../lib/utils';

interface TestFile {
  id: string;
  name: string;
  path: string;
  type: string;
  suite: string;
  status: string;
  testCases: any[];
}

const TestRunner = () => {
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Types');

  const fetchTestFiles = async () => {
    setLoading(true);
    try {
      const response = await api.getTestFiles();
      if (response.success) {
        setTestFiles(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch test files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestFiles();
  }, []);

  const handleRunTestFile = async (file: TestFile) => {
    try {
      if (file.testCases && file.testCases.length > 0) {
        const testCaseIds = file.testCases.map((tc) => tc.id);
        const response = await api.createTestRun({
          name: `Test Run - ${file.name}`,
          testCaseIds,
        });

        if (response.success) {
          alert('Test run started successfully!');
          fetchTestFiles();
        }
      }
    } catch (error) {
      console.error('Failed to start test run:', error);
      alert('Failed to start test run');
    }
  };

  const filteredFiles = testFiles.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All Types' || file.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <Header title="Test Runner" onRefresh={fetchTestFiles} />

      <div className="p-8">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchTestFiles}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Test Cases</span>
              </button>
              <button
                onClick={fetchTestFiles}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Test Files</span>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
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

        {/* Test Cases */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Test Cases
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredFiles.length} of {testFiles.length} test case(s) found
                </p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <FileCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Test Cases Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No test cases were discovered. Check your test directory
                  configuration.
                </p>
                <button
                  onClick={fetchTestFiles}
                  className="mt-4 flex items-center space-x-2 mx-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Discovery</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <FileCode className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {file.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Test file: {file.path}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            File:
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getTestTypeColor(
                          file.type
                        )}`}
                      >
                        {file.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleRunTestFile(file)}
                        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>Run Test Case</span>
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <SettingsIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </button>
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

export default TestRunner;
