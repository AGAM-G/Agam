import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Header } from '../components/layout';
import TestDetailsModal from '../components/TestDetailsModal';
import ConfirmModal from '../components/ConfirmModal';
import { TestControlsBar, TestCard, EmptyTestState } from '../components/test-runner';
import { showNotification } from '../components/ui';
import { api } from '../lib/api';
import { clearAnalyticsCache } from './Analytics';

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
  const location = useLocation();
  const initialFilter = (location.state as { filter?: string })?.filter || 'All Types';
  
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(initialFilter);
  const [activeTestRuns, setActiveTestRuns] = useState<ActiveTestRun[]>([]);
  const [selectedTestRunId, setSelectedTestRunId] = useState<string | null>(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [testRunToStop, setTestRunToStop] = useState<string | null>(null);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  
  // Track previous test run statuses to detect completions
  const previousTestRunsRef = useRef<Map<string, string>>(new Map());

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
        showNotification(
          'success',
          `Successfully discovered ${response.data.discovered} test file(s)!`
        );
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
        showNotification(
          'info',
          'Test files cleaned up! Click "Discover Tests" to re-scan.'
        );
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
          
          // Detect test completions (transition from running to passed/failed)
          let hasCompletedTests = false;
          recentTests.forEach((run: ActiveTestRun) => {
            const previousStatus = previousTestRunsRef.current.get(run.id);
            const currentStatus = run.status;
            
            // Check if test just completed
            if (
              previousStatus === 'running' &&
              (currentStatus === 'passed' || currentStatus === 'failed')
            ) {
              hasCompletedTests = true;
              console.log(`✅ Test completed: ${run.name} - ${currentStatus}`);
            }
            
            // Update previous status
            previousTestRunsRef.current.set(run.id, currentStatus);
          });
          
          // Clear analytics cache when any test completes
          if (hasCompletedTests) {
            clearAnalyticsCache();
          }
          
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

    if (isAlreadyRunning) {
      showNotification(
        'warning',
        'Test is already running! Please wait for it to finish.'
      );
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
        showNotification('warning', 'Test run stopped successfully');

        // Remove from active tests
        handleRemoveNotification(testRunToStop);

        // Refresh test files to update status
        await fetchTestFiles();
      }
    } catch (error) {
      console.error('Failed to stop test run:', error);
      showNotification('error', 'Failed to stop test run');
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
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Test Runner" onRefresh={fetchTestFiles} />

      <div className="flex-1 overflow-y-auto px-8 pt-4 pb-4 space-y-4">
        {/* Controls */}
        <TestControlsBar
          onDiscoverTests={handleDiscoverTests}
          onRefresh={fetchTestFiles}
          onCleanup={handleCleanupTests}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterChange={setFilterType}
          loading={loading}
        />

        {/* Test Cases */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Test Cases
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredFiles.length} of {testFiles.length} test case(s) found
                </p>
              </div>
              <button
                onClick={fetchTestFiles}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <EmptyTestState
                onDiscoverTests={handleDiscoverTests}
                loading={loading}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredFiles.map((file) => {
                  // Find if this file has an active test run
                  // Match by name (could be test name or suite name)
                  const activeRun = activeTestRuns.find(run =>
                    run.name === file.name ||
                    run.name === file.suite ||
                    run.name.includes(file.name) ||
                    file.name.includes(run.name)
                  );

                  return (
                    <TestCard
                      key={file.id}
                      file={file}
                      activeRun={activeRun}
                      onRunTest={handleRunTestFile}
                      onStopTest={handleStopTest}
                      onViewDetails={setSelectedTestRunId}
                    />
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
