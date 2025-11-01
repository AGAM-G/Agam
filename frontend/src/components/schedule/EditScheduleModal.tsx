import { useState } from 'react';
import { X } from 'lucide-react';

interface EditScheduleModalProps {
  schedule: any;
  testCases?: any[];
  testFiles?: any[];
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
}

const EditScheduleModal = ({
  schedule,
  onClose,
  onUpdate,
}: EditScheduleModalProps) => {
  // Format date from database (might be "2025-11-01T00:00:00.000Z") to "2025-11-01"
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Convert UTC time from database to local time for display
  const convertUTCToLocalTime = (utcTimeString: string | undefined) => {
    if (!utcTimeString) return '09:00';
    try {
      const [hours, minutes] = utcTimeString.substring(0, 5).split(':').map(Number);
      const utcDate = new Date();
      utcDate.setUTCHours(hours, minutes, 0, 0);
      
      const localHours = utcDate.getHours().toString().padStart(2, '0');
      const localMinutes = utcDate.getMinutes().toString().padStart(2, '0');
      return `${localHours}:${localMinutes}`;
    } catch {
      return '09:00';
    }
  };

  const [formData, setFormData] = useState({
    name: schedule.name || '',
    scheduleType: schedule.schedule_type || 'one-time',
    scheduledDate: formatDateForInput(schedule.scheduled_date),
    scheduledTime: convertUTCToLocalTime(schedule.scheduled_time), // Show local time
    timezone: schedule.timezone || 'UTC',
    recurrencePattern: {
      days: schedule.recurrence_pattern?.days || [],
      dayOfMonth: schedule.recurrence_pattern?.dayOfMonth || 1,
    },
    description: schedule.description || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Schedule name is required');
      return;
    }

    if (formData.scheduleType === 'one-time' && !formData.scheduledDate) {
      setError('Date is required for one-time schedules');
      return;
    }

    if (formData.scheduleType === 'weekly' && formData.recurrencePattern.days.length === 0) {
      setError('Please select at least one day for weekly schedule');
      return;
    }

    try {
      setSubmitting(true);

      // Convert local time to UTC for storage
      const [hours, minutes] = formData.scheduledTime.split(':').map(Number);
      const localDate = new Date();
      localDate.setHours(hours, minutes, 0, 0);
      
      // Get UTC time
      const utcHours = localDate.getUTCHours().toString().padStart(2, '0');
      const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, '0');
      const utcTime = `${utcHours}:${utcMinutes}`;

      const payload: any = {
        name: formData.name,
        scheduleType: formData.scheduleType,
        scheduledTime: utcTime, // Send UTC time
        timezone: 'UTC', // Always use UTC in backend
        description: formData.description,
      };

      if (formData.scheduleType === 'one-time') {
        payload.scheduledDate = formData.scheduledDate;
      }

      if (formData.scheduleType === 'weekly' || formData.scheduleType === 'monthly') {
        payload.recurrencePattern = formData.recurrencePattern;
      }

      await onUpdate(schedule.id, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleWeekday = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrencePattern: {
        ...prev.recurrencePattern,
        days: prev.recurrencePattern.days.includes(day)
          ? prev.recurrencePattern.days.filter((d: number) => d !== day)
          : [...prev.recurrencePattern.days, day].sort(),
      },
    }));
  };

  const weekdays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Test Schedule
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Schedule Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Daily API Tests"
            />
          </div>

          {/* Test Info (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test
            </label>
            <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
              {schedule.test_case_name || schedule.test_file_name || 'No test selected'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Test cannot be changed after creation
            </p>
          </div>

          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule Type *
            </label>
            <select
              value={formData.scheduleType}
              onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="one-time">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Date (for one-time) */}
          {formData.scheduleType === 'one-time' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Weekdays (for weekly) */}
          {formData.scheduleType === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days of Week *
              </label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.recurrencePattern.days.includes(day.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {formData.scheduleType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Day of Month *
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.recurrencePattern.dayOfMonth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurrencePattern: {
                      ...formData.recurrencePattern,
                      dayOfMonth: parseInt(e.target.value) || 1,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time *
            </label>
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add notes about this schedule..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal;

