import { Calendar, Clock, Play, Pause, Trash2, CheckCircle, XCircle, Edit } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  schedule_type: string;
  scheduled_time: string;
  scheduled_date?: string;
  enabled: boolean;
  next_run_at?: string;
  last_run_at?: string;
  last_run_status?: string;
  run_count: number;
  test_case_name?: string;
  test_file_name?: string;
  user_name?: string;
  recurrence_pattern?: any;
}

interface ScheduleBoardProps {
  schedules: Schedule[];
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
}

const ScheduleBoard = ({ schedules, onToggle, onEdit, onDelete }: ScheduleBoardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTime = (timeString: string) => {
    // Convert UTC time to local time for display
    try {
      const [hours, minutes] = timeString.substring(0, 5).split(':').map(Number);
      const utcDate = new Date();
      utcDate.setUTCHours(hours, minutes, 0, 0);
      
      const localHours = utcDate.getHours().toString().padStart(2, '0');
      const localMinutes = utcDate.getMinutes().toString().padStart(2, '0');
      return `${localHours}:${localMinutes}`;
    } catch {
      return timeString.substring(0, 5); // Fallback
    }
  };

  const getNextRunColor = (nextRun?: string) => {
    if (!nextRun) return 'text-gray-500 dark:text-gray-400';
    
    const next = new Date(nextRun);
    const now = new Date();
    const diffHours = (next.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'text-red-600 dark:text-red-400';
    if (diffHours < 1) return 'text-orange-600 dark:text-orange-400';
    if (diffHours < 24) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Check if test is currently running (last_run_at within 5 minutes and next_run is past)
  const isTestRunning = (schedule: Schedule) => {
    if (!schedule.last_run_at) return false;
    
    const lastRun = new Date(schedule.last_run_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastRun.getTime()) / (1000 * 60);
    
    // If last run was within 5 minutes, consider it running
    return diffMinutes < 5;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const colors = {
      passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      skipped: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };

    const icons = {
      passed: <CheckCircle className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      skipped: null,
    };

    return (
      <span className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded ${colors[status as keyof typeof colors] || colors.skipped}`}>
        {icons[status as keyof typeof icons]}
        <span>{status}</span>
      </span>
    );
  };

  const getScheduleTypeDisplay = (type: string, pattern?: any, date?: string) => {
    switch (type) {
      case 'one-time':
        return `Once on ${date ? new Date(date).toLocaleDateString() : 'N/A'}`;
      case 'daily':
        return 'Daily';
      case 'weekly':
        if (pattern?.days) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const days = pattern.days.map((d: number) => dayNames[d]).join(', ');
          return `Weekly on ${days}`;
        }
        return 'Weekly';
      case 'monthly':
        if (pattern?.dayOfMonth) {
          return `Monthly on day ${pattern.dayOfMonth}`;
        }
        return 'Monthly';
      default:
        return type;
    }
  };

  // Group schedules by enabled status
  const enabledSchedules = schedules.filter(s => s.enabled);
  const disabledSchedules = schedules.filter(s => !s.enabled);

  return (
    <div className="space-y-6">
      {/* Active Schedules */}
      {enabledSchedules.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Active Schedules ({enabledSchedules.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {enabledSchedules.map((schedule) => {
              const isRunning = isTestRunning(schedule);
              return (
              <div
                key={schedule.id}
                className={`rounded-lg p-5 border shadow-sm transition-all ${
                  isRunning
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/50 animate-pulse'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {schedule.name}
                      </h4>
                      {isRunning && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mr-1.5 animate-ping"></span>
                          Running
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {schedule.test_case_name || schedule.test_file_name || 'No test selected'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Only show edit if test hasn't started running yet and not currently running */}
                    {schedule.run_count === 0 && !isRunning && (
                      <button
                        onClick={() => onEdit(schedule)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit schedule"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {!isRunning && (
                      <button
                        onClick={() => onToggle(schedule.id, false)}
                        className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                        title="Pause schedule"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {!isRunning && (
                      <button
                        onClick={() => onDelete(schedule.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {getScheduleTypeDisplay(schedule.schedule_type, schedule.recurrence_pattern, schedule.scheduled_date)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      at {formatTime(schedule.scheduled_time)}
                    </span>
                  </div>

                  {schedule.next_run_at && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Play className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className={`font-medium ${getNextRunColor(schedule.next_run_at)}`}>
                        Next run: {formatDate(schedule.next_run_at)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      Runs: {schedule.run_count}
                    </span>
                    {schedule.last_run_status && (
                      <span className="flex items-center space-x-1">
                        <span className="text-gray-600 dark:text-gray-400">Last:</span>
                        {getStatusBadge(schedule.last_run_status)}
                      </span>
                    )}
                  </div>
                  {schedule.user_name && (
                    <span className="text-gray-500 dark:text-gray-400">
                      by {schedule.user_name}
                    </span>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* Disabled Schedules */}
      {disabledSchedules.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Paused Schedules ({disabledSchedules.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {disabledSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700 opacity-75"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-400 mb-1">
                      {schedule.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {schedule.test_case_name || schedule.test_file_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Only show edit if test hasn't started running yet */}
                    {schedule.run_count === 0 && (
                      <button
                        onClick={() => onEdit(schedule)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit schedule"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggle(schedule.id, true)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                      title="Resume schedule"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(schedule.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {getScheduleTypeDisplay(schedule.schedule_type, schedule.recurrence_pattern, schedule.scheduled_date)} at {formatTime(schedule.scheduled_time)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleBoard;

