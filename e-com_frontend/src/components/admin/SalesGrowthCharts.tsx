import React from 'react';
import { TrendingUp, Clock, Calendar, Award, ArrowUpRight } from 'lucide-react';

// Currency formatting helper
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export interface ChartClickDetail {
  title: string;
  value: string;
  details: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. WEEKLY SALES LOG CHART (Bar + Trend Line Graph)
// ─────────────────────────────────────────────────────────────────────────────
interface WeeklySalesLogProps {
  data?: { day: string; count: number; revenue: number }[];
  onPointClick?: (detail: ChartClickDetail) => void;
}

export const WeeklySalesLogChart: React.FC<WeeklySalesLogProps> = ({
  data = [],
  onPointClick,
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  const handleClick = (d: { day: string; count: number; revenue: number }) => {
    if (onPointClick) {
      onPointClick({
        title: `Weekly Sales Log: ${d.day}`,
        value: `${d.count} Orders (${formatCurrency(d.revenue)})`,
        details: `Sales activity recorded on ${d.day}: ${d.count} completed orders generating ${formatCurrency(d.revenue)} total revenue. Average basket value: ${formatCurrency(Math.round(d.revenue / (d.count || 1)))}.`,
      });
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-slate-900">Weekly Sales Log</h3>
            <p className="text-[11px] text-slate-400 font-medium">Order velocity & revenue by day</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black text-blue-600">{formatCurrency(totalRevenue)}</div>
          <div className="text-[10px] font-bold text-slate-400">Weekly Volume</div>
        </div>
      </div>

      <div className="h-44 w-full flex items-end justify-between px-2 gap-2 relative pt-6">
        {data.length > 0 ? (
          data.map((d, i) => {
            const h = (d.count / maxCount) * 100;
            return (
              <div
                key={i}
                onClick={() => handleClick(d)}
                className="flex-1 flex flex-col items-center group cursor-pointer relative"
              >
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9.5px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap z-30">
                  {d.day}: {d.count} orders ({formatCurrency(d.revenue)})
                </div>

                <div className="w-full flex items-end justify-center h-32">
                  <div
                    className="w-full max-w-[28px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg group-hover:from-blue-700 shadow-sm relative"
                    style={{ height: `${Math.max(8, h)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 mt-2">{d.day}</span>
              </div>
            );
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[11px] font-bold">
            No order volume recorded for this week
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MONTHLY SALES LOG CHART (Multi-Month Growth Chart)
// ─────────────────────────────────────────────────────────────────────────────
interface MonthlySalesLogProps {
  data?: { month: string; revenue: number; orders: number }[];
  onPointClick?: (detail: ChartClickDetail) => void;
}

export const MonthlySalesLogChart: React.FC<MonthlySalesLogProps> = ({
  data = [],
  onPointClick,
}) => {
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  const totalRev = data.reduce((sum, d) => sum + d.revenue, 0);

  const handleClick = (d: { month: string; revenue: number; orders: number }) => {
    if (onPointClick) {
      onPointClick({
        title: `Monthly Sales Log: ${d.month}`,
        value: `${formatCurrency(d.revenue)} (${d.orders} Orders)`,
        details: `Total monthly gross revenue for ${d.month} reached ${formatCurrency(d.revenue)} across ${d.orders} orders.`,
      });
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-slate-900">Monthly Sales Log</h3>
            <p className="text-[11px] text-slate-400 font-medium">Multi-month revenue progression</p>
          </div>
        </div>
        <span className="text-[10.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5" /> Total {formatCurrency(totalRev)}
        </span>
      </div>

      <div className="h-44 w-full flex items-end justify-between px-2 gap-3 border-b border-slate-100 pb-1 pt-6 relative">
        {data.length > 0 ? (
          data.map((d, i) => {
            const h = (d.revenue / maxRev) * 100;
            return (
              <div
                key={i}
                onClick={() => handleClick(d)}
                className="flex-1 flex flex-col items-center group cursor-pointer relative"
              >
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9.5px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap z-30">
                  {d.month}: {formatCurrency(d.revenue)} ({d.orders} orders)
                </div>

                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-xl group-hover:from-purple-700 shadow-sm"
                  style={{ height: `${Math.max(8, h)}%` }}
                />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-600 mt-2">{d.month}</span>
              </div>
            );
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[11px] font-bold">
            No monthly sales revenue recorded
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. PEAK ORDER HOURS CHART ("Which time gets more orders?")
// ─────────────────────────────────────────────────────────────────────────────
interface PeakOrderHoursProps {
  timeSlots?: { slot: string; label: string; count: number; percentage: number; isPeak?: boolean }[];
  onPointClick?: (detail: ChartClickDetail) => void;
}

export const PeakOrderHoursChart: React.FC<PeakOrderHoursProps> = ({
  timeSlots = [],
  onPointClick,
}) => {
  const maxCount = Math.max(...timeSlots.map((t) => t.count), 1);
  const peakSlot = timeSlots.find((t) => t.isPeak) || timeSlots[0];

  const handleClick = (slot: { slot: string; label: string; count: number; percentage: number; isPeak?: boolean }) => {
    if (onPointClick) {
      onPointClick({
        title: `Peak Order Time Slot: ${slot.slot} (${slot.label})`,
        value: `${slot.count} Orders (${slot.percentage}% Share)`,
        details: `Time slot ${slot.label} recorded ${slot.count} customer orders (${slot.percentage}% of overall daily order volume). ${slot.isPeak ? '🔥 HIGHEST CONVERSION TIME WINDOW OF THE DAY!' : 'Regular shopping traffic.'}`,
      });
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-slate-900">Peak Order Hours Analysis</h3>
            <p className="text-[11px] text-slate-400 font-medium">Which time window gets more orders?</p>
          </div>
        </div>
        {peakSlot && (
          <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-xl flex items-center gap-1">
            🔥 Peak: {peakSlot.label}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {timeSlots.length > 0 ? (
          timeSlots.map((slot, i) => {
            const pct = Math.round((slot.count / maxCount) * 100);
            return (
              <div
                key={i}
                onClick={() => handleClick(slot)}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer group ${
                  slot.isPeak ? 'bg-amber-50/60 border border-amber-200/80 shadow-sm' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-900 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${slot.isPeak ? 'bg-amber-500' : 'bg-slate-300'}`} />
                    <span>{slot.slot} ({slot.label})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-900 font-black">{slot.count} orders</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{slot.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${slot.isPeak ? 'bg-amber-500' : 'bg-blue-600'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-400 text-[11px] font-bold">
            No order timestamps recorded to compute peak hours
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. TOP SELLING PRODUCTS BAR CHART ("Which product sells more?")
// ─────────────────────────────────────────────────────────────────────────────
interface TopSellingProductsProps {
  products?: { productId: string; name: string; brand?: string; unitsSold: number; revenue: number }[];
  onPointClick?: (detail: ChartClickDetail) => void;
}

export const TopSellingProductsBarChart: React.FC<TopSellingProductsProps> = ({
  products = [],
  onPointClick,
}) => {
  const maxUnits = Math.max(...products.map((p) => p.unitsSold), 1);

  const handleClick = (prod: { productId: string; name: string; brand?: string; unitsSold: number; revenue: number }, rank: number) => {
    if (onPointClick) {
      onPointClick({
        title: `Product Rank #${rank}: ${prod.name}`,
        value: `${prod.unitsSold} Units Sold (${formatCurrency(prod.revenue)})`,
        details: `Top performing catalog item #${rank}. Brand: ${prod.brand || 'NatCart'}. Total units sold: ${prod.unitsSold}. Total gross revenue: ${formatCurrency(prod.revenue)}. Average price per unit: ${formatCurrency(Math.round(prod.revenue / (prod.unitsSold || 1)))}.`,
      });
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-slate-900">Top Selling Products Ranking</h3>
            <p className="text-[11px] text-slate-400 font-medium">Which product sells more in volume & revenue?</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ranked #1-#5</span>
      </div>

      <div className="space-y-3">
        {products.length > 0 ? (
          products.slice(0, 5).map((prod, i) => {
            const pct = Math.round((prod.unitsSold / maxUnits) * 100);
            const badgeColors = ['bg-amber-100 text-amber-800 border-amber-200', 'bg-slate-100 text-slate-700', 'bg-orange-100 text-orange-800', 'bg-slate-50 text-slate-600', 'bg-slate-50 text-slate-600'];

            return (
              <div
                key={prod.productId}
                onClick={() => handleClick(prod, i + 1)}
                className="p-2.5 rounded-2xl hover:bg-slate-50 transition-all space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11.5px] font-bold">
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center border flex-shrink-0 ${badgeColors[i] || 'bg-slate-100'}`}>
                      #{i + 1}
                    </span>
                    <span className="truncate text-slate-900 group-hover:text-blue-600">{prod.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-slate-900 font-black">{prod.unitsSold} units</span>
                    <span className="text-[11px] font-extrabold text-blue-600">{formatCurrency(prod.revenue)}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-400 text-[11px] font-bold">
            No products cataloged or sold yet
          </div>
        )}
      </div>
    </div>
  );
};
