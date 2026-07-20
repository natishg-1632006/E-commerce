import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// 1. SPEEDOMETER RADIAL GAUGE (Semi-Circle Speedometer with Needle)
// ─────────────────────────────────────────────────────────────────────────────
interface SpeedometerGaugeProps {
  percentage: number; // 0 to 100
  subtitle?: string;
  minLabel?: string;
  maxLabel?: string;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  percentage = 88,
  subtitle = 'Target Score',
  minLabel = '0%',
  maxLabel = '100%',
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

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
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
          className="transition-all duration-1000 ease-out"
        />

        <g transform={`rotate(${needleAngle}, ${cx}, ${cy})`} className="transition-transform duration-700 ease-out">
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
        <div className="text-2.5xl font-black text-slate-900 leading-none">{clampPct}%</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{subtitle}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROGRESS DONUT RING (Schedule 1 Ring with Dual Category Arcs)
// ─────────────────────────────────────────────────────────────────────────────
interface ProgressDonutRingProps {
  percentage: number;
  labelLeft?: string;
  labelRight?: string;
  valueLeft?: string;
  valueRight?: string;
}

export const ProgressDonutRing: React.FC<ProgressDonutRingProps> = ({
  percentage = 88,
  labelLeft = 'Completed Orders',
  labelRight = 'Pending / Other',
  valueLeft = '88%',
  valueRight = '12%',
}) => {
  const clampPct = Math.min(100, Math.max(0, percentage));
  const size = 140;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const blueLength = (clampPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-between h-full space-y-4">
      <div className="relative w-35 h-35 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f97316"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#2563eb"
            strokeWidth={strokeWidth}
            strokeDasharray={`${blueLength} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{clampPct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-100 text-[11px]">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
          <div className="truncate">
            <div className="text-slate-400 font-semibold truncate">{labelLeft}</div>
            <div className="font-extrabold text-slate-900">{valueLeft}</div>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
          <div className="truncate">
            <div className="text-slate-400 font-semibold truncate">{labelRight}</div>
            <div className="font-extrabold text-slate-900">{valueRight}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. MINI TREND LINE NODE (Schedule 2 Node Graph)
// ─────────────────────────────────────────────────────────────────────────────
interface MiniTrendLineNodeProps {
  data?: number[];
  leftTitle?: string;
  leftSub?: string;
  rightTitle?: string;
  rightSub?: string;
}

export const MiniTrendLineNode: React.FC<MiniTrendLineNodeProps> = ({
  data = [35, 65, 45, 80, 50],
  leftTitle = 'Direct Revenue',
  leftSub = '₹2,85,000',
  rightTitle = 'Referral Revenue',
  rightSub = '₹1,00,000',
}) => {
  const w = 220;
  const h = 85;
  const paddingX = 15;
  const paddingY = 15;

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  const stepX = (w - paddingX * 2) / (data.length - 1);
  const points = data.map((val, i) => ({
    x: paddingX + i * stepX,
    y: h - paddingY - ((val - minVal) / range) * (h - paddingY * 2),
  }));

  const pathStr = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  return (
    <div className="flex flex-col justify-between h-full space-y-3">
      <div className="w-full relative flex items-center justify-center">
        <svg width={w} height={h} className="overflow-visible">
          <path d={pathStr} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill={i % 2 === 0 ? '#f97316' : '#2563eb'}
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
        <div>
          <div className="text-slate-400 font-semibold">{leftTitle}</div>
          <div className="font-extrabold text-slate-900">{leftSub}</div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 font-semibold">{rightTitle}</div>
          <div className="font-extrabold text-slate-900">{rightSub}</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. STACKED PROGRESS BAR (Schedule 3 Category Meter)
// ─────────────────────────────────────────────────────────────────────────────
interface StackedProgressBarProps {
  totalTracked?: string;
  segments?: { label: string; value: number; color: string; code: string }[];
}

export const StackedProgressBar: React.FC<StackedProgressBarProps> = ({
  totalTracked = '₹3,85,000 Total',
  segments = [
    { label: 'Electronics', value: 45, color: '#2563eb', code: '01' },
    { label: 'Accessories', value: 30, color: '#60a5fa', code: '02' },
    { label: 'Fashion', value: 15, color: '#fdba74', code: '03' },
    { label: 'Other', value: 10, color: '#f97316', code: '04' },
  ],
}) => {
  const totalVal = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">All Tracked</span>
        <span className="text-sm font-black text-slate-900">{totalTracked}</span>
      </div>

      <div className="w-full h-4 bg-slate-100 rounded-lg flex overflow-hidden p-0.5 space-x-0.5">
        {segments.map((seg, i) => {
          const pct = (seg.value / totalVal) * 100;
          return (
            <div
              key={i}
              className="h-full first:rounded-l-md last:rounded-r-md transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${pct.toFixed(0)}%`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10.5px]">
        {segments.slice(0, 3).map((seg, i) => (
          <div key={i} className="flex items-start space-x-1.5">
            <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <div>
              <div className="font-mono text-slate-400 font-bold">{seg.code}</div>
              <div className="font-extrabold text-slate-900 truncate">{seg.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DUAL COLUMN BAR CHART (Main Schedule Comparison Chart)
// ─────────────────────────────────────────────────────────────────────────────
interface DualColumnBarChartProps {
  data: { label: string; val1: number; val2: number }[];
  series1Name?: string;
  series2Name?: string;
}

export const DualColumnBarChart: React.FC<DualColumnBarChartProps> = ({
  data = [
    { label: 'Jan', val1: 40, val2: 55 },
    { label: 'Feb', val1: 65, val2: 38 },
    { label: 'Mar', val1: 50, val2: 70 },
    { label: 'Apr', val1: 85, val2: 45 },
    { label: 'May', val1: 35, val2: 60 },
  ],
  series1Name = 'Gross Orders',
  series2Name = 'Net Revenue',
}) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.val1, d.val2]), 100);

  return (
    <div className="w-full space-y-4">
      <div className="h-44 w-full flex items-end justify-between px-2 gap-2 relative border-b border-slate-100">
        {[0, 25, 50, 75, 100].map((pct) => (
          <div
            key={pct}
            className="absolute left-0 right-0 border-b border-slate-100 text-[9px] font-mono text-slate-300 pl-1"
            style={{ bottom: `${pct}%` }}
          >
            {Math.round((pct / 100) * maxVal)}
          </div>
        ))}

        {data.map((d, i) => {
          const h1 = (d.val1 / maxVal) * 100;
          const h2 = (d.val2 / maxVal) * 100;

          return (
            <div key={i} className="flex-1 flex flex-col items-center z-10">
              <div className="flex items-end space-x-1 h-36 w-full justify-center">
                <div
                  className="w-3.5 bg-blue-600 rounded-t-sm transition-all duration-700 hover:bg-blue-700"
                  style={{ height: `${h1}%` }}
                  title={`${series1Name}: ${d.val1}`}
                />
                <div
                  className="w-3.5 bg-orange-400 rounded-t-sm transition-all duration-700 hover:bg-orange-500"
                  style={{ height: `${h2}%` }}
                  title={`${series2Name}: ${d.val2}`}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2">{d.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center space-x-6 text-[11px] font-bold">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-sm bg-blue-600" />
          <span className="text-slate-700">{series1Name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-sm bg-orange-400" />
          <span className="text-slate-700">{series2Name}</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. ROUNDED BAR GRAPH (Account / Sales Growth Graph)
// ─────────────────────────────────────────────────────────────────────────────
interface RoundedBarGraphProps {
  data: { month: string; value: number }[];
}

export const RoundedBarGraph: React.FC<RoundedBarGraphProps> = ({
  data = [
    { month: 'Jan', value: 20 },
    { month: 'Feb', value: 40 },
    { month: 'Mar', value: 55 },
    { month: 'Apr', value: 70 },
    { month: 'May', value: 85 },
    { month: 'Jun', value: 95 },
  ],
}) => {
  const maxVal = Math.max(...data.map((d) => d.value), 100);

  return (
    <div className="w-full space-y-2">
      <div className="h-32 flex items-end justify-between px-2 gap-3 border-b border-slate-100 pb-1">
        {data.map((d, i) => {
          const h = (d.value / maxVal) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <div
                className="w-full bg-blue-600 rounded-t-xl transition-all duration-700 group-hover:bg-blue-700 shadow-sm"
                style={{ height: `${h}%` }}
                title={`${d.month}: ${d.value}`}
              />
              <span className="text-[10px] font-bold text-slate-400 mt-2">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. METRIC SLIDER GAUGE (Interactive Metric Range Track)
// ─────────────────────────────────────────────────────────────────────────────
interface MetricSliderGaugeProps {
  percentage?: number;
}

export const MetricSliderGauge: React.FC<MetricSliderGaugeProps> = ({
  percentage = 80,
}) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return (
    <div className="w-full space-y-4 py-2">
      <div className="relative w-full h-8 flex items-center">
        <div className="w-full h-1 bg-slate-200 rounded-full" />

        <div className="absolute inset-0 flex items-center justify-between px-2">
          {months.map((_, i) => (
            <div key={i} className="w-0.5 h-3 bg-slate-300 rounded-full" />
          ))}
        </div>

        <div
          className="absolute z-10 flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-full font-black text-[11px] shadow-lg shadow-blue-500/30 transform -translate-x-1/2 cursor-pointer border-2 border-white"
          style={{ left: `${percentage}%` }}
        >
          {percentage}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-400 px-1">
        {months.map((m, i) => (
          <span key={i} className={m === 'Apr' ? 'text-blue-600 font-extrabold' : ''}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. MULTI METRIC BAR SERIES (Weekly Payment / Activity Bar Series)
// ─────────────────────────────────────────────────────────────────────────────
interface MultiMetricBarSeriesProps {
  days?: { day: string; height: number; hasNode?: boolean }[];
}

export const MultiMetricBarSeries: React.FC<MultiMetricBarSeriesProps> = ({
  days = [
    { day: 'Mon', height: 40, hasNode: true },
    { day: 'Tue', height: 75, hasNode: false },
    { day: 'Wed', height: 60, hasNode: true },
    { day: 'Thu', height: 90, hasNode: false },
    { day: 'Fri', height: 85, hasNode: true },
    { day: 'Sat', height: 50, hasNode: false },
    { day: 'Sun', height: 65, hasNode: true },
  ],
}) => {
  return (
    <div className="w-full h-36 flex items-end justify-between px-1 gap-2 border-b border-slate-100 pb-1">
      {days.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group">
          <div className="relative w-2.5 bg-blue-600 rounded-full flex flex-col items-center justify-start transition-all duration-700 group-hover:bg-blue-700" style={{ height: `${d.height}%` }}>
            {d.hasNode && (
              <span className="w-2 h-2 rounded-full bg-white border border-blue-600 absolute -top-1 shadow-sm" />
            )}
          </div>
          <span className="text-[9.5px] font-bold text-slate-400 mt-2">{d.day}</span>
        </div>
      ))}
    </div>
  );
};
