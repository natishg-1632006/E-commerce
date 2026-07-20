import React from 'react';

// Currency formatting helper
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. SPEEDOMETER RADIAL GAUGE (Semi-Circle Speedometer with Needle)
// ─────────────────────────────────────────────────────────────────────────────
interface SpeedometerGaugeProps {
  percentage: number; // 0 to 100
  subtitle?: string;
  minLabel?: string;
  maxLabel?: string;
  onClick?: (data: { title: string; value: string; details: string }) => void;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  percentage = 0,
  subtitle = 'Target Score',
  minLabel = '0%',
  maxLabel = '100%',
  onClick,
}) => {
  const clampPct = Math.min(100, Math.max(0, percentage));
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;

  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (clampPct / 100) * arcLength;
  const needleAngle = -90 + (clampPct / 100) * 180;

  const handleClick = () => {
    if (onClick) {
      onClick({
        title: 'Sales Fulfillment Target Score',
        value: `${clampPct}%`,
        details: `Current fulfillment score based on real database completed vs pending orders. ${clampPct}% of orders delivered successfully.`,
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col items-center justify-center relative select-none cursor-pointer group p-1"
      title="Click for Fulfillment Details"
    >
      {/* Pure CSS Floating Hover Tooltip (Zero Blinking) */}
      <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute -top-7 z-30 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
        Fulfillment Score: {clampPct}% (Click for details)
      </div>

      <svg width={size} height={size / 2 + 35} className="overflow-visible">
        <defs>
          <linearGradient id="speedometerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#speedometerGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
        />

        <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - radius + 18} stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
        </g>

        <text x={cx - radius} y={cy + 18} fontSize="10" fill="#94a3b8" fontWeight="700" textAnchor="middle">
          {minLabel}
        </text>
        <text x={cx + radius} y={cy + 18} fontSize="10" fill="#94a3b8" fontWeight="700" textAnchor="middle">
          {maxLabel}
        </text>
      </svg>

      <div className="text-center -mt-4">
        <div className="text-2.5xl font-black text-slate-900 leading-none group-hover:text-blue-600">
          {clampPct}%
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{subtitle}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROGRESS DONUT RING (Dual Color Ring Chart)
// ─────────────────────────────────────────────────────────────────────────────
interface ProgressDonutRingProps {
  percentage: number;
  labelLeft?: string;
  labelRight?: string;
  valueLeft?: string;
  valueRight?: string;
  onClick?: (data: { title: string; value: string; details: string }) => void;
}

export const ProgressDonutRing: React.FC<ProgressDonutRingProps> = ({
  percentage = 0,
  labelLeft = 'Completed',
  labelRight = 'Pending',
  valueLeft = '0 orders',
  valueRight = '0 orders',
  onClick,
}) => {
  const clampPct = Math.min(100, Math.max(0, percentage));
  const size = 150;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const mainOffset = circumference - (clampPct / 100) * circumference;

  const handleClick = () => {
    if (onClick) {
      onClick({
        title: 'Net Revenue & Fulfillment Velocity',
        value: `${clampPct}% Completed`,
        details: `${valueLeft} completed vs ${valueRight} pending fulfillment. Total conversion velocity score: ${clampPct}%.`,
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col items-center justify-center space-y-3 cursor-pointer group"
      title="Click for Revenue Velocity Details"
    >
      <div className="relative flex items-center justify-center">
        {/* Pure CSS Hover Tooltip */}
        <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute -top-6 z-30 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
          {clampPct}% Completed Orders ({valueLeft})
        </div>

        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f97316"
            strokeWidth={strokeWidth}
          />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#2563eb"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={mainOffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-900 group-hover:text-blue-600">
            {clampPct}%
          </span>
          <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Ratio</span>
        </div>
      </div>

      <div className="w-full flex items-center justify-between px-2 text-[11px] font-bold">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <div>
            <div className="text-slate-900 leading-none">{labelLeft}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{valueLeft}</div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-right">
          <div>
            <div className="text-slate-900 leading-none">{labelRight}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{valueRight}</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. MINI TREND LINE NODE (Bezier curve with nodes)
// ─────────────────────────────────────────────────────────────────────────────
interface MiniTrendLineNodeProps {
  data?: number[];
  leftTitle?: string;
  leftSub?: string;
  rightTitle?: string;
  rightSub?: string;
  onClick?: (data: { title: string; value: string; details: string }) => void;
}

export const MiniTrendLineNode: React.FC<MiniTrendLineNodeProps> = ({
  data = [0, 0, 0, 0, 0, 0],
  leftTitle = 'Total Revenue',
  leftSub = '₹0',
  rightTitle = 'Avg Basket',
  rightSub = '₹0',
  onClick,
}) => {
  const width = 220;
  const height = 45;
  const padding = 10;

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);

  const points = data.map((val, idx) => {
    const x = padding + (idx / Math.max(1, data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - padding * 2);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  const handleClick = (idx: number, val: number) => {
    if (onClick) {
      onClick({
        title: 'Order Conversion Volume Trend',
        value: `Checkpoint ${idx + 1}: ${formatCurrency(val)}`,
        details: `Sales volume trend checkpoint ${idx + 1}. Recorded order amount: ${formatCurrency(val)}. Total Revenue: ${leftSub}, Avg Basket: ${rightSub}.`,
      });
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="w-full flex items-center justify-center py-2 relative">
        <svg width={width} height={height} className="overflow-visible">
          <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />

          {points.map((pt, i) => {
            const isOrange = i % 2 === 0;
            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill={isOrange ? '#f97316' : '#2563eb'}
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer group"
                onClick={() => handleClick(i, pt.val)}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-bold">
        <div>
          <span className="text-slate-400 block text-[9.5px] uppercase">{leftTitle}</span>
          <span className="text-slate-900">{leftSub}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block text-[9.5px] uppercase">{rightTitle}</span>
          <span className="text-slate-900">{rightSub}</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. STACKED MULTI-CATEGORY PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
interface SegmentItem {
  label: string;
  value: number;
  color: string;
  code?: string;
}

interface StackedProgressBarProps {
  segments?: SegmentItem[];
  totalTracked?: string;
  onClick?: (data: { title: string; value: string; details: string }) => void;
}

export const StackedProgressBar: React.FC<StackedProgressBarProps> = ({
  segments = [],
  totalTracked = '₹0',
  onClick,
}) => {
  const totalVal = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const handleClick = (s: SegmentItem) => {
    if (onClick) {
      onClick({
        title: `Category Share: ${s.label}`,
        value: `${formatCurrency(s.value)} (${Math.round((s.value / totalVal) * 100)}%)`,
        details: `Category ${s.label} represents ${Math.round((s.value / totalVal) * 100)}% of total category revenue (${totalTracked}).`,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-slate-400 text-[10px] uppercase">All Tracked Category Share</span>
        <span className="text-slate-900 font-black text-[13px]">{totalTracked}</span>
      </div>

      {segments.length > 0 ? (
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex relative">
          {segments.map((seg, i) => {
            const pct = Math.max(1, (seg.value / totalVal) * 100);
            return (
              <div
                key={i}
                className="h-full transition-colors cursor-pointer group relative"
                style={{ width: `${pct}%`, backgroundColor: seg.color }}
                onClick={() => handleClick(seg)}
              >
                {/* Pure CSS Hover Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
                  {seg.label}: {Math.round((seg.value / totalVal) * 100)}% ({formatCurrency(seg.value)})
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-[9px] font-bold text-slate-400">
          No category sales recorded yet
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 pt-1">
        {segments.map((seg, i) => (
          <div
            key={i}
            onClick={() => handleClick(seg)}
            className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <div className="truncate text-[10px] font-bold text-slate-700">
              <span className="text-slate-400 mr-1">{seg.code || `0${i + 1}`}</span>
              <span className="truncate">{seg.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DUAL COLUMN VERTICAL BAR CHART
// ─────────────────────────────────────────────────────────────────────────────
interface DualColumnBarChartProps {
  data?: { label: string; val1: number; val2: number }[];
  series1Name?: string;
  series2Name?: string;
  onClick?: (data: { title: string; value: string; details: string }) => void;
}

export const DualColumnBarChart: React.FC<DualColumnBarChartProps> = ({
  data = [],
  series1Name = 'Gross Orders',
  series2Name = 'Net Revenue',
  onClick,
}) => {
  const handleClick = (item: { label: string; val1: number; val2: number }) => {
    if (onClick) {
      onClick({
        title: `Period ${item.label} Breakdown`,
        value: `${series1Name}: ${item.val1} | ${series2Name}: ${item.val2}%`,
        details: `Detailed performance breakdown for period ${item.label}. ${series1Name}: ${item.val1} orders vs ${series2Name}: ${item.val2}% margin target.`,
      });
    }
  };

  return (
    <div className="space-y-3 relative">
      <div className="h-36 w-full flex items-end justify-between px-2 gap-3 pt-6">
        {data.length > 0 ? (
          data.map((item, i) => (
            <div
              key={i}
              onClick={() => handleClick(item)}
              className="flex-1 flex flex-col items-center group cursor-pointer relative"
            >
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
                P{item.label}: {item.val1} Orders / {item.val2}% Margin
              </div>

              <div className="w-full flex items-end justify-center space-x-1.5 h-28">
                <div
                  className="w-3 bg-blue-600 rounded-t-sm group-hover:bg-blue-700 shadow-sm"
                  style={{ height: `${Math.max(8, item.val1)}%` }}
                />
                <div
                  className="w-3 bg-orange-500 rounded-t-sm group-hover:bg-orange-600 shadow-sm"
                  style={{ height: `${Math.max(8, item.val2)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 mt-2">{item.label}</span>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[11px] font-bold">
            No trend data available for selected period
          </div>
        )}
      </div>

      <div className="flex items-center justify-center space-x-4 text-[10.5px] font-bold pt-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />
          <span className="text-slate-600">{series1Name}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm" />
          <span className="text-slate-600">{series2Name}</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. ROUNDED BAR GRAPH (Vertical Rounded Top Bars)
// ─────────────────────────────────────────────────────────────────────────────
interface RoundedBarGraphProps {
  data?: { month: string; value: number }[];
  onClick?: (data: { title: string; value: string; details: string }) => void;
}

export const RoundedBarGraph: React.FC<RoundedBarGraphProps> = ({
  data = [],
  onClick,
}) => {
  const handleClick = (item: { month: string; value: number }) => {
    if (onClick) {
      onClick({
        title: `Sales Growth: ${item.month}`,
        value: `${item.value}% Target Revenue`,
        details: `Monthly revenue growth for ${item.month} reached ${item.value}% of target milestone.`,
      });
    }
  };

  return (
    <div className="space-y-2 relative">
      <div className="h-32 w-full flex items-end justify-between px-1 gap-2 pt-6">
        {data.length > 0 ? (
          data.map((item, i) => (
            <div
              key={i}
              onClick={() => handleClick(item)}
              className="flex-1 flex flex-col items-center group cursor-pointer relative"
            >
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
                {item.month}: {item.value}% Growth
              </div>

              <div className="w-full bg-slate-100 rounded-full h-24 flex items-end justify-center p-0.5 overflow-hidden">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full group-hover:from-emerald-600"
                  style={{ height: `${Math.max(5, item.value)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 mt-1.5">{item.month}</span>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[11px] font-bold">
            No monthly growth data recorded
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. METRIC SLIDER GAUGE (Range Track with Bubble Node)
// ─────────────────────────────────────────────────────────────────────────────
interface MetricSliderGaugeProps {
  percentage?: number;
  label?: string;
  onClick?: (data: { title: string; value: string; details: string }) => void;
}

export const MetricSliderGauge: React.FC<MetricSliderGaugeProps> = ({
  percentage = 0,
  label = 'Stock Ratio Health',
  onClick,
}) => {
  const clampPct = Math.min(100, Math.max(0, percentage));

  const handleClick = () => {
    if (onClick) {
      onClick({
        title: 'Inventory Stock Availability Ratio',
        value: `${clampPct}% Optimal Stock`,
        details: `Current warehouse stock health ratio is ${clampPct}%. Calculated directly from active inventory records.`,
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="space-y-3 cursor-pointer group p-1 relative"
      title="Click for Inventory Ratio Breakdown"
    >
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="text-slate-400 uppercase text-[10px]">{label}</span>
        <span className="text-blue-600 font-black">{clampPct}%</span>
      </div>

      <div className="relative w-full h-3 bg-slate-100 rounded-full flex items-center px-1">
        <div
          className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
          style={{ width: `${clampPct}%` }}
        />

        <div
          className="absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-md transform -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${clampPct}%` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        </div>
      </div>

      <div className="flex justify-between text-[9.5px] font-bold text-slate-400 px-1">
        <span>0% Critical</span>
        <span>50% Moderate</span>
        <span>100% Healthy</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. MULTI-METRIC VERTICAL BAR SERIES
// ─────────────────────────────────────────────────────────────────────────────
interface DayMetric {
  day: string;
  height: number;
  hasNode?: boolean;
}

interface MultiMetricBarSeriesProps {
  days?: DayMetric[];
  onClick?: (data: { title: string; value: string; details: string }) => void;
}

export const MultiMetricBarSeries: React.FC<MultiMetricBarSeriesProps> = ({
  days = [],
  onClick,
}) => {
  const handleClick = (d: DayMetric) => {
    if (onClick) {
      onClick({
        title: `Weekly Order Distribution: ${d.day}`,
        value: `${d.height}% Traffic Peak`,
        details: `Order & payment channel traffic on ${d.day} reached ${d.height}% of weekly peak capacity.`,
      });
    }
  };

  return (
    <div className="space-y-3 relative">
      <div className="h-32 w-full flex items-end justify-between px-1 gap-2 pt-6">
        {days.length > 0 ? (
          days.map((d, i) => (
            <div
              key={i}
              onClick={() => handleClick(d)}
              className="flex-1 flex flex-col items-center group cursor-pointer relative"
            >
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
                {d.day}: {d.height}% Volume
              </div>

              <div className="w-full flex justify-center h-24 items-end relative">
                <div
                  className="w-2.5 bg-purple-500 rounded-t-sm group-hover:bg-purple-600 shadow-sm"
                  style={{ height: `${Math.max(8, d.height)}%` }}
                />
                {d.hasNode && (
                  <span className="absolute top-0 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white shadow-sm" />
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-600 mt-1.5">{d.day}</span>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[11px] font-bold">
            No weekly distribution data
          </div>
        )}
      </div>
    </div>
  );
};
