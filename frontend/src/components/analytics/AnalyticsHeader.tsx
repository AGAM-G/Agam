interface AnalyticsHeaderProps {
  isFromCache: boolean;
  timeRange: 7 | 14 | 30;
  onTimeRangeChange: (range: 7 | 14 | 30) => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  isFromCache,
  timeRange,
  onTimeRangeChange,
}) => {
  return (
    <div className="flex justify-between items-center">
      {isFromCache && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Loaded from cache • Auto-refresh active</span>
        </div>
      )}
      {!isFromCache && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live data • Auto-refresh active</span>
        </div>
      )}
      <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        {[7, 14, 30].map((days) => (
          <button
            key={days}
            onClick={() => onTimeRangeChange(days as 7 | 14 | 30)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              timeRange === days
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${days === 7 ? 'rounded-l-lg' : ''} ${days === 30 ? 'rounded-r-lg' : ''}`}
          >
            Last {days} days
          </button>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsHeader;

