import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Zap,
  X,
} from 'lucide-react';

import { AnalyticsSkeleton } from '../../components/admin/AdminSkeletons';
import { analyticsService } from '../../services/analytics.service';
import type {
  AnalyticsDashboardData,
  RevenueAnalytics,
  OrderAnalytics,
  SystemHealthData,
  SalesGrowthAnalyticsData,
} from '../../services/analytics.service';

import { AreaChart } from '../../components/admin/AnalyticsCharts';
import { MetricSliderGauge } from '../../components/admin/AnalyticsDashboardWidgets';
import {
  WeeklySalesLogChart,
  MonthlySalesLogChart,
  PeakOrderHoursChart,
  TopSellingProductsBarChart,
} from '../../components/admin/SalesGrowthCharts';

// Currency formatting helper
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Date Period options
const PERIOD_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7days', label: 'Last 7 Days' },
  { key: 'last30days', label: 'Last 30 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
];

export interface DetailModalData {
  title: string;
  value: string;
  details: string;
}

const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState('last30days');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Click Detail Modal State
  const [selectedDetail, setSelectedDetail] = useState<DetailModalData | null>(null);

  // Analytics Data States
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [orderData, setOrderData] = useState<OrderAnalytics | null>(null);
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [salesGrowthData, setSalesGrowthData] = useState<SalesGrowthAnalyticsData | null>(null);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [dash, rev, ord, prod, health, growth] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getRevenue(period),
        analyticsService.getOrders(),
        analyticsService.getProducts(),
        analyticsService.getHealth(),
        analyticsService.getSalesGrowthAnalytics(),
      ]);

      if (!prod) console.warn('Product data fallback active');

      setDashboardData(dash);
      setRevenueData(rev);
      setOrderData(ord);
      setHealthData(health);
      setSalesGrowthData(growth);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const selectedPeriodLabel = PERIOD_OPTIONS.find((p) => p.key === period)?.label || 'Last 30 Days';

  const handleWidgetClick = (data: DetailModalData) => {
    setSelectedDetail(data);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-7 space-y-6 bg-slate-50/70 min-h-screen relative">
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* INTERACTIVE GRAPH CLICK DETAIL MODAL */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {selectedDetail && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 relative">
              <button
                onClick={() => setSelectedDetail(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">{selectedDetail.title}</h3>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                    {selectedDetail.value}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[12.5px] font-medium text-slate-700 leading-relaxed">
                {selectedDetail.details}
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold transition-all shadow-md cursor-pointer"
                >
                  Close Insights
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-extrabold text-blue-600 tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Sales & Peak Hours Intelligence</span>
            </div>
            <h1 className="text-2.5xl font-black text-slate-900 tracking-tight mt-0.5">
              Sales Growth & Peak Hours Dashboard
            </h1>
            <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">
              Real-time sales velocity, revenue timeline, stock availability & peak order patterns
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Service Status Chip */}
            {healthData && (
              <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync Active</span>
              </div>
            )}

            {/* Date Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 text-[12px] font-bold hover:bg-slate-50 transition-all flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedPeriodLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPeriodDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-1.5 animate-fadeIn">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setPeriod(opt.key);
                        setShowPeriodDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-[12px] font-semibold flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        period === opt.key ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {period === opt.key && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Content Loading State */}
        {loading ? (
          <AnalyticsSkeleton />
        ) : (
          /* ════════════════════════════════════════════════════════════════ */
          /* PURE SALES GROWTH & PEAK HOURS INTELLIGENCE DASHBOARD */
          /* ════════════════════════════════════════════════════════════════ */
          <div className="space-y-6 animate-fadeIn">
            {/* ROW 1: GENERAL REVENUE TIMELINE & WEEKLY SALES LOG */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900">General Revenue Timeline</h2>
                    <p className="text-[11.5px] text-slate-400 font-medium">Daily income & order volume timeline for {selectedPeriodLabel}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] font-bold">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span className="text-slate-700">Revenue (₹)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="text-slate-700">Orders Count</span>
                    </div>
                  </div>
                </div>
                <AreaChart
                  data={(revenueData?.timeline || []).map((t) => {
                    const orderCountForDate = (orderData?.orderTrend || []).find((o) => o.date === t.date)?.count || 0;
                    return {
                      label: t.date.slice(5),
                      value: t.revenue,
                      secondaryValue: orderCountForDate,
                    };
                  })}
                  primaryColor="#3b82f6"
                  secondaryColor="#8b5cf6"
                  height={170}
                  formatValue={(v) => formatCurrency(v)}
                />
              </div>

              {/* Weekly Sales Log */}
              <WeeklySalesLogChart data={salesGrowthData?.weeklySalesLog} onPointClick={handleWidgetClick} />
            </div>

            {/* ROW 2: MONTHLY SALES LOG & STOCK AVAILABILITY RATIO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <MonthlySalesLogChart data={salesGrowthData?.monthlySalesLog} onPointClick={handleWidgetClick} />
              </div>

              {/* Stock Availability Ratio */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-[13.5px] font-black text-slate-900">Stock Availability Ratio</h3>
                    <p className="text-[10.5px] text-slate-400 font-medium">Warehouse inventory health ratio from DB</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {dashboardData?.inventoryHealthPercentage || 0}% Ratio
                  </span>
                </div>
                <MetricSliderGauge percentage={dashboardData?.inventoryHealthPercentage || 0} onClick={handleWidgetClick} />
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Current Stock: {dashboardData?.inventorySummary.totalCurrentStock || 0}</span>
                  <span className="text-amber-600">Low Stock: {dashboardData?.lowStock || 0}</span>
                </div>
              </div>
            </div>

            {/* ROW 3: PEAK ORDER HOURS & TOP SELLING PRODUCTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PeakOrderHoursChart timeSlots={salesGrowthData?.peakOrderHours} onPointClick={handleWidgetClick} />
              <TopSellingProductsBarChart products={salesGrowthData?.topSellingProductsRanked} onPointClick={handleWidgetClick} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
