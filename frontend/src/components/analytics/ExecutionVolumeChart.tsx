import { type DailyStats } from '../../lib/analyticsCalculations';

interface ExecutionVolumeChartProps {
  data: DailyStats[];
}

/**
 * EXECUTION VOLUME CHART COMPONENT
 * Renders a stacked bar chart showing passed vs failed test runs per day
 * Green bars = passed, Red bars = failed
 */
const ExecutionVolumeChart: React.FC<ExecutionVolumeChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const padding = 40;

  // Find max value for scaling
  const maxRuns = Math.max(...data.map((stat) => stat.totalRuns), 1);

  const barWidth = (width - padding * 2) / data.length - 4;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-48"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, Math.ceil(maxRuns / 4), Math.ceil(maxRuns / 2), Math.ceil((maxRuns * 3) / 4), maxRuns].map(
          (value) => {
            const y = height - padding - (value / maxRuns) * (height - padding * 2);
            return (
              <g key={value}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  className="stroke-gray-200 dark:stroke-gray-700"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  className="fill-gray-500 dark:fill-gray-400 text-xs"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          }
        )}

        {/* Bars */}
        {data.map((stat, index) => {
          const x = padding + index * ((width - padding * 2) / data.length) + 2;
          const passedHeight =
            stat.totalRuns > 0
              ? (stat.passedRuns / maxRuns) * (height - padding * 2)
              : 0;
          const failedHeight =
            stat.totalRuns > 0
              ? (stat.failedRuns / maxRuns) * (height - padding * 2)
              : 0;

          return (
            <g key={stat.date}>
              {/* Failed bar (on top) */}
              {stat.failedRuns > 0 && (
                <rect
                  x={x}
                  y={height - padding - passedHeight - failedHeight}
                  width={barWidth}
                  height={failedHeight}
                  className="fill-red-500 dark:fill-red-600"
                  rx="2"
                />
              )}
              {/* Passed bar (on bottom) */}
              {stat.passedRuns > 0 && (
                <rect
                  x={x}
                  y={height - padding - passedHeight}
                  width={barWidth}
                  height={passedHeight}
                  className="fill-green-500 dark:fill-green-600"
                  rx="2"
                />
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((stat, index) => {
          if (index % Math.ceil(data.length / 5) === 0 || index === data.length - 1) {
            const x = padding + index * ((width - padding * 2) / data.length) + barWidth / 2 + 2;
            const date = new Date(stat.date);
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <text
                key={stat.date}
                x={x}
                y={height - 10}
                className="fill-gray-500 dark:fill-gray-400 text-xs"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          }
          return null;
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Passed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 dark:bg-red-600 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
        </div>
      </div>
    </div>
  );
};

export default ExecutionVolumeChart;

