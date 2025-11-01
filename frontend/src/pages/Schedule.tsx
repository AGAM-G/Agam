import { useState, useEffect } from 'react';
import { Header } from '../components/layout';
import { api } from '../lib/api';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { ScheduleBoard, CreateScheduleModal, EditScheduleModal } from '../components/schedule';
import ConfirmModal from '../components/ConfirmModal';

const Schedule = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [testFiles, setTestFiles] = useState<any[]>([]);

  const fetchSchedules = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.getScheduledTests();
      if (response.success) {
        setSchedules(response.data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTestOptions = async () => {
    try {
      const [casesResponse, filesResponse] = await Promise.all([
        api.getTestCases(),
        api.getTestFiles(),
      ]);

      if (casesResponse.success) {
        setTestCases(casesResponse.data);
      }

      if (filesResponse.success) {
        setTestFiles(filesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching test options:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchTestOptions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSchedules(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateSchedule = async (data: any) => {
    try {
      const response = await api.createScheduledTest(data);
      if (response.success) {
        setShowCreateModal(false);
        fetchSchedules(true);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  const handleToggleSchedule = async (id: string, enabled: boolean) => {
    try {
      await api.toggleScheduledTest(id, enabled);
      fetchSchedules(true);
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteScheduleId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteScheduleId) return;

    try {
      await api.deleteScheduledTest(deleteScheduleId);
      fetchSchedules(true);
      setDeleteScheduleId(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleEditClick = (schedule: any) => {
    setEditingSchedule(schedule);
    setShowEditModal(true);
  };

  const handleUpdateSchedule = async (id: string, data: any) => {
    try {
      const response = await api.updateScheduledTest(id, data);
      if (response.success) {
        setShowEditModal(false);
        setEditingSchedule(null);
        fetchSchedules(true);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  };

  const handleRefresh = () => {
    fetchSchedules(true);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
        <Header title="Test Schedule" showActions={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading schedules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Test Schedule" showActions={false} />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Test Schedule</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage automated test schedules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex-1 sm:flex-initial"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create</span>
            </button>
          </div>
        </div>

        {/* Schedule Board */}
        {schedules.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Scheduled Tests
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating your first automated test schedule
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create Schedule</span>
            </button>
          </div>
        ) : (
          <ScheduleBoard
            schedules={schedules}
            onToggle={handleToggleSchedule}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Create Schedule Modal */}
        {showCreateModal && (
          <CreateScheduleModal
            testCases={testCases}
            testFiles={testFiles}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateSchedule}
          />
        )}

        {/* Edit Schedule Modal */}
        {showEditModal && editingSchedule && (
          <EditScheduleModal
            schedule={editingSchedule}
            testCases={testCases}
            testFiles={testFiles}
            onClose={() => {
              setShowEditModal(false);
              setEditingSchedule(null);
            }}
            onUpdate={handleUpdateSchedule}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteScheduleId(null);
          }}
          title="Delete Scheduled Test"
          message="Are you sure you want to delete this scheduled test? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default Schedule;

