import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ChevronDown,
  Wallet,
  ShoppingCart,
  Grid,
} from 'lucide-react';

import { AnalyticsSkeleton } from '../../components/admin/AdminSkeletons';

// SVG bar chart reuse
const monthlyData = [
  { month: 'Jan', revenue: 65, orders: 420 },
  { month: 'Feb', revenue: 72, orders: 510 },
  { month: 'Mar', revenue: 58, orders: 380 },
  { month: 'Apr', revenue: 80, orders: 620 },
  { month: 'May', revenue: 91, orders: 740 },
  { month: 'Jun', revenue: 75, orders: 580 },
  { month: 'Jul', revenue: 96, orders: 842 },
];

const BarChart: React.FC<{ data: { label: string; value: number }[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value));
  const chartH = 120;
  const barW = 26;
  const gap = 14;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <svg width="100%" viewBox={`0 0 ${totalW + 16} ${chartH + 22}`} preserveAspectRatio="xMidYMid meet">
      {data.map((d, i) => {
        const barH = (d.value / max) * chartH;
        const x = 8 + i * (barW + gap);
        const y = chartH - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH} rx={6} fill={color} opacity={i === data.length - 1 ? '1' : '0.55'} />
            <text x={x + barW / 2} y={chartH + 15} textAnchor="middle" fontSize="8.5" fill="#94a3b8" fontWeight="600" fontFamily="Inter, sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

// --- Compact Stat Card component ---
interface AnalyticsStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  growth: string;
  isUp: boolean;
}

const AnalyticsStatCard: React.FC<AnalyticsStatCardProps> = ({ title, value, subtitle, icon, iconBgColor, growth, isUp }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-[16px] h-[142px] p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex flex-col min-w-0">
          <span className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider truncate">{title}</span>
          <span className="text-[9.5px] text-slate-455 font-bold mt-0.5 leading-none">{subtitle}</span>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between mt-1">
        <span className="text-2.5xl font-black tracking-tight leading-none text-slate-800">{value}</span>
        <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${
          isUp ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'
        }`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{growth}</span>
        </span>
      </div>
    </div>
  );
};

const topCategories = [
  { name: 'Laptops', revenue: '₹5.2Cr', share: 62, color: '#3b82f6' },
  { name: 'Gaming', revenue: '₹1.8Cr', share: 21, color: '#8b5cf6' },
  { name: 'Storage', revenue: '₹0.7Cr', share: 9, color: '#10b981' },
  { name: 'Accessories', revenue: '₹0.7Cr', share: 8, color: '#f59e0b' },
];

const AdminAnalytics: React.FC = () => {
  const period = 'Last 7 Months';
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminLayout>
      <div className="p-5 sm:p-7 space-y-6">
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[12px] font-bold text-blue-600 tracking-wider uppercase">Business Intelligence</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Analytics</h1>
            <p className="text-[12.5px] text-slate-550 font-medium mt-0.5">Performance insights & monthly statistics</p>
          </div>
          <button className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-slate-650 text-[12px] font-bold hover:bg-slate-50 transition-all flex items-center space-x-1.5 shadow-sm self-start sm:self-auto cursor-pointer">
            <span>{period}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <AnalyticsSkeleton />
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Compact KPI Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsStatCard
                title="Total Revenue"
                value="₹8.4Cr"
                subtitle="Updated Today"
                icon={<Wallet className="w-[18px] h-[18px]" />}
                iconBgColor="bg-blue-50 text-blue-600"
                growth="18.2%"
                isUp={true}
              />
              <AnalyticsStatCard
                title="Total Orders"
                value="4,092"
                subtitle="Updated Today"
                icon={<ShoppingCart className="w-[18px] h-[18px]" />}
                iconBgColor="bg-purple-50 text-purple-600"
                growth="12.7%"
                isUp={true}
              />
              <AnalyticsStatCard
                title="New Customers"
                value="1,284"
                subtitle="Updated Today"
                icon={<Users className="w-[18px] h-[18px]" />}
                iconBgColor="bg-emerald-50 text-emerald-650"
                growth="9.3%"
                isUp={true}
              />
              <AnalyticsStatCard
                title="Avg Order Value"
                value="₹20,530"
                subtitle="Updated Today"
                icon={<TrendingDown className="w-[18px] h-[18px]" />}
                iconBgColor="bg-red-50 text-red-500"
                growth="2.1%"
                isUp={false}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trend */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[14.5px] font-black text-slate-900 leading-tight">Monthly Revenue</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-4">Year-to-date performance</p>
                <div className="w-full">
                  <BarChart
                    data={monthlyData.map(d => ({ label: d.month, value: d.revenue }))}
                    color="#3b82f6"
                  />
                </div>
              </div>

              {/* Category Share Breakdown */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-[14.5px] font-black text-slate-900 leading-tight">Revenue by Category</h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-4">Share of total</p>
                </div>
                <div className="space-y-3 flex-1">
                  {topCategories.map(cat => (
                    <div key={cat.name} className="p-1 rounded-xl border border-transparent hover:border-slate-50 hover:bg-slate-50/20 transition-all duration-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1">
                          <Grid className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cat.name}</span>
                        </span>
                        <span className="text-[11px] font-extrabold text-slate-800">{cat.revenue}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${cat.share}%`, background: cat.color }}
                        />
                      </div>
                      <div className="text-[9.5px] text-slate-400 font-bold mt-1 text-right">{cat.share}% Share</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders Volume Trend */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[14.5px] font-black text-slate-900 leading-tight">Orders Volume</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-4">Monthly order count trend</p>
              <div className="w-full">
                <BarChart
                  data={monthlyData.map(d => ({ label: d.month, value: d.orders }))}
                  color="#8b5cf6"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
