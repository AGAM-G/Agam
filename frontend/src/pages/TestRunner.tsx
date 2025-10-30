import { useEffect, useState } from 'react';
import {
  Search,
  Play,
  RefreshCw,
  FileCode,
  Eye,
  StopCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Header from '../components/layout/Header';
import TestDetailsModal from '../components/TestDetailsModal';
import ConfirmModal from '../components/ConfirmModal';
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

interface ActiveTestRun {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  started_at: string;
}

const TestRunner = () => {
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [activeTestRuns, setActiveTestRuns] = useState<ActiveTestRun[]>([]);
  const [selectedTestRunId, setSelectedTestRunId] = useState<string | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [testRunToStop, setTestRunToStop] = useState<string | null>(null);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

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

  const handleDiscoverTests = async () => {
    setLoading(true);
    try {
      const response = await api.discoverTests();
      if (response.success) {
        // Show success notification briefly
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-green-900 dark:text-green-100 font-medium">Successfully discovered ${response.data.discovered} test file(s)!</span>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        await fetchTestFiles();
      }
    } catch (error) {
      console.error('Failed to discover tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupTests = () => {
    setShowCleanupConfirm(true);
  };

  const confirmCleanupTests = async () => {
    setLoading(true);
    try {
      const response = await api.cleanupTestFiles();
      if (response.success) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-blue-900 dark:text-blue-100 font-medium">Test files cleaned up! Click "Discover Tests" to re-scan.</span>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        await fetchTestFiles();
      }
    } catch (error) {
      console.error('Failed to cleanup tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestFiles();
  }, []);

  // Poll for active test runs
  useEffect(() => {
    const pollActiveTests = async () => {
      try {
        // Get all recent test runs (running, pending, and recently completed)
        const recentResponse = await api.getTestRuns({ limit: 50 });
        if (recentResponse.success) {
          const now = Date.now();
          const recentTests = recentResponse.data.filter((run: any) => {
            // Always include running and pending tests
            if (run.status === 'running' || run.status === 'pending') {
              return true;
            }
            
            // Include recently completed tests (within last 5 seconds)
            if (run.status === 'passed' || run.status === 'failed') {
              const completedAt = new Date(run.completed_at).getTime();
              return (now - completedAt) < 5000;
            }
            
            return false;
          });
          
          console.log('📊 Active test runs:', recentTests.map((r: ActiveTestRun) => ({ name: r.name, status: r.status })));
          setActiveTestRuns(recentTests);
        }
      } catch (error) {
        console.error('Failed to fetch active test runs:', error);
      }
    };

    pollActiveTests();
    const interval = setInterval(pollActiveTests, 2000); // Poll every 2 seconds for faster updates

    return () => clearInterval(interval);
  }, []);

  const handleRunTestFile = async (file: TestFile) => {
    // Check if this test is already running (match by name or suite)
    const isAlreadyRunning = activeTestRuns.some(
      run => (
        (run.name === file.name || 
         run.name === file.suite ||
         run.name.includes(file.name) ||
         file.name.includes(run.name)) &&
        (run.status === 'running' || run.status === 'pending')
      )
    );
    
    console.log('🎯 Check if running:', { 
      fileName: file.name, 
      suite: file.suite,
      isAlreadyRunning,
      activeRuns: activeTestRuns.map((r: ActiveTestRun) => ({ name: r.name, status: r.status }))
    });

    if (isAlreadyRunning) {
      // Show notification that test is already running
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span class="text-yellow-900 dark:text-yellow-100 font-medium">Test is already running! Please wait for it to finish.</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }

    try {
      const response = await api.executeTestFile(file.id);

      if (response.success) {
        // Add to active test runs immediately with the suite name (backend uses this)
        const newRun: ActiveTestRun = {
          id: `temp-${file.id}-${Date.now()}`,
          name: file.suite || file.name, // Use suite name (what backend returns)
          status: 'pending',
          started_at: new Date().toISOString(),
        };
        console.log('✅ Created temp run:', newRun);
        setActiveTestRuns(prev => [newRun, ...prev]);
        
        // Poll for the actual run to appear
        setTimeout(async () => {
          try {
            const runsResponse = await api.getTestRuns({ limit: 10 });
            if (runsResponse.success && runsResponse.data.length > 0) {
              // Find the latest run that matches this file
              const latestRun = runsResponse.data.find((run: any) => 
                run.name === file.suite || 
                run.name === file.name ||
                run.name.includes(file.name) ||
                file.name.includes(run.name)
              );
              
              if (latestRun) {
                console.log('🔄 Updating temp run with real run:', latestRun);
                // Update with real test run ID
                setActiveTestRuns(prev => 
                  prev.map(run => 
                    run.id.startsWith(`temp-${file.id}`)
                      ? { ...latestRun, id: latestRun.id }
                      : run
                  )
                );
              } else {
                console.log('⚠️ Could not find matching run for file:', file.name);
              }
            }
          } catch (err) {
            console.error('Failed to fetch updated test run:', err);
          }
        }, 1500);

        await fetchTestFiles();
      }
    } catch (error) {
      console.error('Failed to start test execution:', error);
    }
  };

  const handleRemoveNotification = (testRunId: string) => {
    setActiveTestRuns(prev => prev.filter(run => run.id !== testRunId));
  };

  const handleStopTest = (testRunId: string) => {
    setTestRunToStop(testRunId);
    setShowStopConfirm(true);
  };

  const confirmStopTest = async () => {
    if (!testRunToStop) return;

    try {
      const response = await api.stopTestRun(testRunToStop);
      if (response.success) {
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 shadow-lg';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span class="text-orange-900 dark:text-orange-100 font-medium">Test run stopped successfully</span>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);

        // Remove from active tests
        handleRemoveNotification(testRunToStop);
        
        // Refresh test files to update status
        await fetchTestFiles();
      }
    } catch (error) {
      console.error('Failed to stop test run:', error);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="text-red-900 dark:text-red-100 font-medium">Failed to stop test run</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setTestRunToStop(null);
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
                onClick={handleDiscoverTests}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileCode className="w-4 h-4" />
                <span>Discover Tests</span>
              </button>
              <button
                onClick={fetchTestFiles}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleCleanupTests}
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
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Click "Discover Tests" to scan your test directory and register all available tests.
                </p>
                <button
                  onClick={handleDiscoverTests}
                  disabled={loading}
                  className="flex items-center space-x-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <FileCode className="w-5 h-5" />
                  <span>Discover Tests Now</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFiles.map((file) => {
                  // Find if this file has an active test run
                  // Match by name (could be test name or suite name)
                  const activeRun = activeTestRuns.find(run => 
                    run.name === file.name || 
                    run.name === file.suite ||
                    run.name.includes(file.name) ||
                    file.name.includes(run.name)
                  );
                  const isRunning = activeRun?.status === 'running' || activeRun?.status === 'pending';
                  const justCompleted = activeRun && (activeRun.status === 'passed' || activeRun.status === 'failed');
                  
                  // Debug logging
                  if (activeRun) {
                    console.log('🔍 Match found:', {
                      fileName: file.name,
                      runName: activeRun.name,
                      status: activeRun.status,
                      isRunning,
                      justCompleted
                    });
                  }

                  return (
                    <div
                      key={file.id}
                      className={`border rounded-lg p-6 transition-all ${
                        isRunning 
                          ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                          : justCompleted
                          ? activeRun.status === 'passed'
                            ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            isRunning 
                              ? 'bg-blue-100 dark:bg-blue-800' 
                              : justCompleted && activeRun.status === 'passed'
                              ? 'bg-green-100 dark:bg-green-800'
                              : justCompleted && activeRun.status === 'failed'
                              ? 'bg-red-100 dark:bg-red-800'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {isRunning ? (
                              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
                            ) : justCompleted && activeRun.status === 'passed' ? (
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            ) : justCompleted && activeRun.status === 'failed' ? (
                              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            ) : (
                              <FileCode className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {file.suite}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                              {file.testCases?.length || 0} test case(s)
                            </p>
                            {isRunning && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{activeRun.status === 'pending' ? 'Starting...' : 'Running...'}</span>
                              </p>
                            )}
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
                        {isRunning ? (
                          // Running state: Show View Details and Stop buttons
                          <div className="flex items-center space-x-2 w-full">
                            <button
                              onClick={() => setSelectedTestRunId(activeRun.id)}
                              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => handleStopTest(activeRun.id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <StopCircle className="w-4 h-4" />
                              <span>Stop</span>
                            </button>
                          </div>
                        ) : justCompleted ? (
                          // Just completed: Show result and View Details
                          <div className="flex items-center justify-between w-full">
                            <button
                              onClick={() => setSelectedTestRunId(activeRun.id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View Results</span>
                            </button>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              activeRun.status === 'passed' 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {activeRun.status}
                            </span>
                          </div>
                        ) : (
                          // Normal state: Show Run button
                          <>
                            <button
                              onClick={() => handleRunTestFile(file)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <Play className="w-4 h-4" />
                              <span>Run Tests</span>
                            </button>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              file.status === 'passed' 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : file.status === 'failed'
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {file.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
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
          onConfirm={confirmStopTest}
          onCancel={() => {
            setShowStopConfirm(false);
            setTestRunToStop(null);
          }}
          title="Stop Test Execution?"
          message="Are you sure you want to stop this test? All pending tests will be marked as skipped and the test run will be marked as failed."
          confirmText="Stop Test"
          cancelText="Continue Running"
          type="danger"
        />

        {/* Cleanup Confirmation Modal */}
        <ConfirmModal
          isOpen={showCleanupConfirm}
          onConfirm={confirmCleanupTests}
          onCancel={() => setShowCleanupConfirm(false)}
          title="Clean Up Database?"
          message="This will remove all test files and test cases from the database. You will need to click 'Discover Tests' again to re-scan your test directory."
          confirmText="Clean Up"
          cancelText="Cancel"
          type="warning"
        />
      </div>
    </div>
  );
};

export default TestRunner;
