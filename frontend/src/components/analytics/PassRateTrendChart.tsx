import { type DailyStats } from '../../lib/analyticsCalculations';

interface PassRateTrendChartProps {
  data: DailyStats[];
}

/**
 * PASS RATE CHART COMPONENT
 * Renders a line chart showing pass rate percentage over time
 * Uses SVG for rendering with responsive dimensions
 */
const PassRateTrendChart: React.FC<PassRateTrendChartProps> = ({ data }) => {
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
  const maxRate = 100; // Pass rate is always 0-100%

  // Create points for the line
  const points = data
    .map((stat, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - (stat.passRate / maxRate) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-48"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = height - padding - (value / maxRate) * (height - padding * 2);
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
                {value}%
              </text>
            </g>
          );
        })}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          className="stroke-blue-600 dark:stroke-blue-400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((stat, index) => {
          const x = padding + (index / (data.length - 1)) * (width - padding * 2);
          const y = height - padding - (stat.passRate / maxRate) * (height - padding * 2);
          return (
            <circle
              key={stat.date}
              cx={x}
              cy={y}
              r="4"
              className="fill-blue-600 dark:fill-blue-400"
            />
          );
        })}

        {/* X-axis labels (show every few days to avoid crowding) */}
        {data.map((stat, index) => {
          if (index % Math.ceil(data.length / 5) === 0 || index === data.length - 1) {
            const x = padding + (index / (data.length - 1)) * (width - padding * 2);
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
    </div>
  );
};

export default PassRateTrendChart;

