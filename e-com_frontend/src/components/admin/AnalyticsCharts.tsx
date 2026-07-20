import React, { useState } from 'react';

// --- Smooth Cubic Bezier Helper ---
const getCubicPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Area Chart Component (Compact, Sleek Cubic Bezier Area Chart)
// ─────────────────────────────────────────────────────────────────────────────
interface AreaChartProps {
  data: { label: string; value: number; secondaryValue?: number }[];
  primaryColor?: string;
  secondaryColor?: string;
  height?: number;
  valuePrefix?: string;
  formatValue?: (v: number) => string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  primaryColor = '#3b82f6',
  secondaryColor = '#8b5cf6',
  height = 170,
  valuePrefix = '',
  formatValue,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center text-slate-400 font-medium text-xs">
        No analytics data available for selected range.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const secValues = data.map((d) => d.secondaryValue ?? 0);
  const maxVal = Math.max(...values, ...secValues, 1);

  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = 950;
  const chartHeight = height - paddingY * 2;

  const stepX = data.length > 1 ? (chartWidth - paddingX * 2) / (data.length - 1) : 0;

  const primaryPoints = data.map((d, i) => ({
    x: paddingX + i * stepX,
    y: height - paddingY - (d.value / maxVal) * chartHeight,
  }));

  const secondaryPoints = data.map((d, i) => ({
    x: paddingX + i * stepX,
    y: height - paddingY - ((d.secondaryValue ?? 0) / maxVal) * chartHeight,
  }));

  const primaryPath = getCubicPath(primaryPoints);
  const primaryArea = `${primaryPath} L ${primaryPoints[primaryPoints.length - 1].x} ${height - paddingY} L ${primaryPoints[0].x} ${height - paddingY} Z`;

  const hasSecondary = data.some((d) => d.secondaryValue !== undefined);
  const secondaryPath = hasSecondary ? getCubicPath(secondaryPoints) : '';

  const formatFn = formatValue || ((v: number) => `${valuePrefix}${v.toLocaleString()}`);

  return (
    <div className="w-full relative select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full max-h-[210px] h-auto overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Background Grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, idx) => {
          const y = height - paddingY - pct * chartHeight;
          const gridValue = Math.round(pct * maxVal);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="9.5"
                fill="#94a3b8"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                {formatFn(gridValue)}
              </text>
            </g>
          );
        })}

        {/* Gradient Fill under Primary Curve */}
        <path d={primaryArea} fill="url(#primaryGradient)" />

        {/* Secondary Line Curve */}
        {hasSecondary && (
          <path
            d={secondaryPath}
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2.2"
            strokeDasharray="4 3"
          />
        )}

        {/* Primary Line Curve */}
        <path
          d={primaryPath}
          fill="none"
          stroke={primaryColor}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Interactive Data Points & Hover Triggers */}
        {primaryPoints.map((pt, i) => (
          <g key={i} className="cursor-pointer" onMouseEnter={() => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}>
            {/* Hover Vertical Guide */}
            {activeIndex === i && (
              <line
                x1={pt.x}
                y1={paddingY}
                x2={pt.x}
                y2={height - paddingY}
                stroke="#cbd5e1"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
            )}

            {/* Point Node */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={activeIndex === i ? '5.5' : '3.5'}
              fill="#ffffff"
              stroke={primaryColor}
              strokeWidth="2.2"
              className="transition-all duration-150"
            />

            {/* Secondary Point Node */}
            {hasSecondary && (
              <circle
                cx={secondaryPoints[i].x}
                cy={secondaryPoints[i].y}
                r="3"
                fill="#ffffff"
                stroke={secondaryColor}
                strokeWidth="1.8"
              />
            )}

            {/* X Axis Label */}
            <text
              x={pt.x}
              y={height - 5}
              textAnchor="middle"
              fontSize="9.5"
              fill={activeIndex === i ? '#1e293b' : '#94a3b8'}
              fontWeight={activeIndex === i ? '800' : '600'}
              fontFamily="Inter, sans-serif"
            >
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>

      {/* Active Hover Floating Tooltip */}
      {activeIndex !== null && (
        <div
          className="absolute z-20 -top-2 bg-slate-900 text-white rounded-xl px-3 py-2 text-[11px] shadow-xl border border-slate-800 pointer-events-none transition-all transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${((primaryPoints[activeIndex].x) / chartWidth) * 100}%`,
          }}
        >
          <div className="font-extrabold text-slate-300 text-[10px] uppercase border-b border-slate-800 pb-1 mb-1">
            {data[activeIndex].label}
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full" style={{ background: primaryColor }} />
            <span>Primary: {formatFn(data[activeIndex].value)}</span>
          </div>
          {data[activeIndex].secondaryValue !== undefined && (
            <div className="flex items-center gap-1.5 font-bold mt-0.5 text-purple-300">
              <span className="w-2 h-2 rounded-full" style={{ background: secondaryColor }} />
              <span>Volume: {data[activeIndex].secondaryValue}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Donut / Radial Chart Component (Compact Size)
// ─────────────────────────────────────────────────────────────────────────────
interface DonutChartItem {
  name: string;
  value: number;
  color: string;
  share?: number;
}

interface DonutChartProps {
  items: DonutChartItem[];
  centerTitle?: string;
  centerSubtitle?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ items, centerTitle, centerSubtitle }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const size = 135;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative w-34 h-34 flex items-center justify-center flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {items.map((item, idx) => {
            const pct = total > 0 ? item.value / total : 0;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += pct * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            );
          })}
        </svg>

        {/* Center Labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[15px] font-black text-slate-900 leading-none">{centerTitle || total}</span>
          <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{centerSubtitle || 'Total'}</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-2 flex-1 w-full">
        {items.map((item, idx) => {
          const sharePct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
          return (
            <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-700 p-1 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-2 truncate pr-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="truncate">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2 font-extrabold text-slate-900 flex-shrink-0">
                <span>{item.value.toLocaleString()}</span>
                <span className="text-[9.5px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md">{sharePct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Mini Sparkline Chart
// ─────────────────────────────────────────────────────────────────────────────
export const Sparkline: React.FC<{ data: number[]; isUp?: boolean; color?: string }> = ({
  data,
  isUp = true,
  color,
}) => {
  if (!data || data.length < 2) return null;
  const strokeColor = color || (isUp ? '#10b981' : '#ef4444');
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const w = 65;
  const h = 20;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((val - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.0"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Horizontal Progress Bar Item
// ─────────────────────────────────────────────────────────────────────────────
interface HorizontalBarProps {
  label: string;
  value: number;
  total: number;
  color?: string;
  formattedValue?: string;
  subtitle?: string;
}

export const HorizontalBar: React.FC<HorizontalBarProps> = ({
  label,
  value,
  total,
  color = '#3b82f6',
  formattedValue,
  subtitle,
}) => {
  const pct = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;

  return (
    <div className="space-y-1 p-1.5 rounded-xl hover:bg-slate-50/50 transition-all">
      <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-800">
        <div className="flex flex-col truncate pr-2">
          <span className="truncate text-slate-900">{label}</span>
          {subtitle && <span className="text-[9px] font-semibold text-slate-400">{subtitle}</span>}
        </div>
        <div className="flex items-center space-x-2 font-extrabold text-slate-900 flex-shrink-0">
          <span>{formattedValue || value.toLocaleString()}</span>
          <span className="text-[9.5px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-bold">{pct.toFixed(0)}%</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 shadow-sm"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};
