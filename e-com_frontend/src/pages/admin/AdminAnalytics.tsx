import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  TrendingUp,
  ChevronDown,
  Wallet,
  ShoppingCart,
  Package,
  RefreshCw,
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  CreditCard,
  ShieldCheck,
  Server,
  Zap,
  Tag,
} from 'lucide-react';

import { AnalyticsSkeleton } from '../../components/admin/AdminSkeletons';
import { analyticsService } from '../../services/analytics.service';
import type {
  AnalyticsDashboardData,
  RevenueAnalytics,
  OrderAnalytics,
  ProductAnalytics,
  CategoryAnalytics,
  SystemHealthData,
} from '../../services/analytics.service';
import { AreaChart, DonutChart, Sparkline, HorizontalBar } from '../../components/admin/AnalyticsCharts';

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

// Navigation Sub-Tabs
type TabKey = 'overview' | 'revenue' | 'products' | 'categories' | 'health';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Executive Overview', icon: <Wallet className="w-3.5 h-3.5" /> },
  { key: 'revenue', label: 'Revenue & Orders', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: 'products', label: 'Products & Inventory', icon: <Package className="w-3.5 h-3.5" /> },
  { key: 'categories', label: 'Categories & Payments', icon: <PieChart className="w-3.5 h-3.5" /> },
  { key: 'health', label: 'System Health', icon: <Activity className="w-3.5 h-3.5" /> },
];

const AdminAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [period, setPeriod] = useState('last30days');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics Data States
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [orderData, setOrderData] = useState<OrderAnalytics | null>(null);
  const [productData, setProductData] = useState<ProductAnalytics | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryAnalytics | null>(null);
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [dash, rev, ord, prod, cat, health] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getRevenue(period),
        analyticsService.getOrders(),
        analyticsService.getProducts(),
        analyticsService.getCategories(),
        analyticsService.getHealth(),
      ]);

      setDashboardData(dash);
      setRevenueData(rev);
      setOrderData(ord);
      setProductData(prod);
      setCategoryData(cat);
      setHealthData(health);
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

  return (
    <AdminLayout>
      <div className="p-4 sm:p-7 space-y-6">
        {/* Top Header Bar */}
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-extrabold text-blue-600 tracking-wider uppercase">
              <Sparkline data={[12, 18, 14, 22, 28, 35]} isUp={true} />
              <span>Real-Time Business Intelligence</span>
            </div>
            <h1 className="text-2.5xl font-black text-slate-900 tracking-tight mt-0.5">
              Analytics & Performance
            </h1>
            <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">
              Enterprise revenue metrics, order volumes & microservice health indicators
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {/* Live Health Status Chip */}
            {healthData && (
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Microservices {healthData.status}</span>
                <span className="text-[9.5px] bg-emerald-200/60 px-1.5 py-0.5 rounded-md font-mono">
                  {healthData.responseTimeMs}ms
                </span>
              </div>
            )}

            {/* Time Period Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[12px] font-bold hover:bg-slate-50 transition-all flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <span>{selectedPeriodLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPeriodDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1.5 animate-fadeIn">
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

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center space-x-1 border-b border-slate-100 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-[12px] font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-550 hover:bg-slate-100/70 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <AnalyticsSkeleton />
        ) : (
          <div className="animate-fadeIn space-y-6">
            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <>
                {/* 4 Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-slate-900">
                        {formatCurrency(dashboardData?.revenue || 0)}
                      </span>
                      <span className="text-[10.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +18.2%
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-50 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>Paid Orders ({dashboardData?.completedOrders || 0})</span>
                      <Sparkline data={[40, 55, 48, 62, 70, 85]} isUp={true} />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-slate-900">
                        {(dashboardData?.orders || 0).toLocaleString()}
                      </span>
                      <span className="text-[10.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +12.4%
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-50 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>Pending: {dashboardData?.pendingOrders || 0}</span>
                      <Sparkline data={[20, 25, 30, 28, 35, 42]} isUp={true} />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Order Value (AOV)</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-slate-900">
                        {formatCurrency(dashboardData?.averageOrderValue || 0)}
                      </span>
                      <span className="text-[10.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +4.8%
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-50 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>Per Basket Average</span>
                      <Sparkline data={[150, 160, 155, 170, 175, 182]} isUp={true} />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-slate-900">
                        {dashboardData?.lowStock || 0} items
                      </span>
                      <span className="text-[10.5px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                        Requires Action
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-50 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>Catalog Total: {dashboardData?.products || 0}</span>
                      <span className="text-amber-600 font-bold">Check Warehouse</span>
                    </div>
                  </div>
                </div>

                {/* Revenue vs Orders Area Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-[14.5px] font-black text-slate-900">Revenue & Order Volume Trend</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Timeline metrics for {selectedPeriodLabel}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-[10.5px] font-bold">
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

                  {/* Category Revenue Distribution Donut */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h2 className="text-[14.5px] font-black text-slate-900">Category Share</h2>
                      <p className="text-[11px] text-slate-400 font-medium mb-3">Revenue distribution across categories</p>
                    </div>

                    <DonutChart
                      items={(categoryData?.categoryStats || []).slice(0, 5).map((cat) => ({
                        name: cat.name,
                        value: cat.revenue || 10,
                        color: cat.color || '#3b82f6',
                      }))}
                      centerTitle={formatCurrency(categoryData?.totalRevenue || 0)}
                      centerSubtitle="Total Revenue"
                    />

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Total Categories: {dashboardData?.categories || 0}</span>
                      <span className="text-blue-600">View All</span>
                    </div>
                  </div>
                </div>

                {/* Quick Summary Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Payment Methods Breakdown */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <h3 className="text-[13.5px] font-black text-slate-900">Payment Gateways</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Live Sync</span>
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(dashboardData?.paymentSummary || {}).map(([method, count]) => {
                        const totalPay = Object.values(dashboardData?.paymentSummary || {}).reduce((a, b) => a + b, 0) || 1;
                        const colors: Record<string, string> = { UPI: '#10b981', Card: '#3b82f6', COD: '#8b5cf6', Wallet: '#f59e0b' };
                        return (
                          <HorizontalBar
                            key={method}
                            label={method}
                            value={count}
                            total={totalPay}
                            color={colors[method] || '#3b82f6'}
                            formattedValue={`${count} orders`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Selling Product Spotlight */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-purple-600" />
                        <h3 className="text-[13.5px] font-black text-slate-900">Top Selling Spotlight</h3>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">Rank #1</span>
                    </div>

                    {productData?.topSellingProducts[0] ? (
                      <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 space-y-2.5">
                        <div>
                          <div className="text-[12.5px] font-extrabold text-slate-900 truncate">
                            {productData.topSellingProducts[0].name}
                          </div>
                          <div className="text-[10.5px] font-bold text-slate-400 mt-0.5">
                            Brand: {productData.topSellingProducts[0].brand || 'NatCart'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[10.5px]">
                          <div>
                            <div className="text-slate-400 font-semibold">Units Sold</div>
                            <div className="text-sm font-black text-slate-800">
                              {productData.topSellingProducts[0].unitsSold} units
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 font-semibold">Total Revenue</div>
                            <div className="text-sm font-black text-blue-600">
                              {formatCurrency(productData.topSellingProducts[0].revenue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 py-6 text-center">No sales data recorded yet.</div>
                    )}
                  </div>

                  {/* Inventory Warehouse Summary */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-[13.5px] font-black text-slate-900">Warehouse Inventory</h3>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Active Stock</span>
                    </div>
                    <div className="space-y-2.5 font-semibold text-[11.5px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Stock</span>
                        <span className="text-slate-900 font-black">
                          {dashboardData?.inventorySummary.totalCurrentStock || 0} units
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reserved in Carts</span>
                        <span className="text-amber-600 font-bold">
                          {dashboardData?.inventorySummary.totalReservedStock || 0} units
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500">Low Stock Warnings</span>
                        <span className="text-red-500 font-bold">
                          {dashboardData?.inventorySummary.lowStockItemsCount || 0} items
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 2: REVENUE & ORDERS */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                {/* Revenue Timeline Graph */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-[14.5px] font-black text-slate-900">Revenue Timeline</h2>
                      <p className="text-[11px] text-slate-400 font-medium">Daily income breakdowns for {selectedPeriodLabel}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-blue-600">{formatCurrency(revenueData?.totalRevenue || 0)}</div>
                      <div className="text-[10px] font-bold text-slate-400">Total Income</div>
                    </div>
                  </div>

                  <AreaChart
                    data={(revenueData?.timeline || []).map((t) => ({ label: t.date.slice(5), value: t.revenue }))}
                    primaryColor="#3b82f6"
                    height={170}
                    formatValue={(v) => formatCurrency(v)}
                  />
                </div>

                {/* Order Status Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-600">Completed Orders</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-600">
                      {orderData?.completed || 0}
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${
                            orderData?.totalOrders
                              ? ((orderData.completed / orderData.totalOrders) * 100).toFixed(0)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 text-right">
                      {orderData?.totalOrders
                        ? ((orderData.completed / orderData.totalOrders) * 100).toFixed(1)
                        : 0}
                      % Success Rate
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-600">Pending Orders</span>
                      <ShoppingCart className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-amber-600">
                      {orderData?.pending || 0}
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${
                            orderData?.totalOrders
                              ? ((orderData.pending / orderData.totalOrders) * 100).toFixed(0)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 text-right">In Fulfillment Pipeline</div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-600">Cancelled Orders</span>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="text-2xl font-black text-red-500">
                      {orderData?.cancelled || 0}
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${
                            orderData?.totalOrders
                              ? ((orderData.cancelled / orderData.totalOrders) * 100).toFixed(0)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 text-right">Cancellation Rate</div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 3: PRODUCTS & INVENTORY */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top 10 Highest Revenue Products */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-[14.5px] font-black text-slate-900">Highest Revenue Products</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Top grossing inventory items</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Top 10</span>
                    </div>

                    <div className="space-y-2">
                      {(productData?.highestRevenueProducts || []).slice(0, 6).map((prod, idx) => {
                        const maxRev = productData?.highestRevenueProducts[0]?.revenue || 1;
                        return (
                          <HorizontalBar
                            key={prod.productId}
                            label={`#${idx + 1} ${prod.name}`}
                            value={prod.revenue}
                            total={maxRev}
                            color="#3b82f6"
                            formattedValue={formatCurrency(prod.revenue)}
                            subtitle={`Brand: ${prod.brand || 'NatCart'} • ${prod.unitsSold} units sold`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Selling by Units Volume */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-[14.5px] font-black text-slate-900">Top Selling Volume</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Items sold in highest quantity</p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">Volume</span>
                    </div>

                    <div className="space-y-2">
                      {(productData?.topSellingProducts || []).slice(0, 6).map((prod, idx) => {
                        const maxUnits = productData?.topSellingProducts[0]?.unitsSold || 1;
                        return (
                          <HorizontalBar
                            key={prod.productId}
                            label={`#${idx + 1} ${prod.name}`}
                            value={prod.unitsSold}
                            total={maxUnits}
                            color="#8b5cf6"
                            formattedValue={`${prod.unitsSold} units`}
                            subtitle={`Revenue: ${formatCurrency(prod.revenue)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Warehouse Inventory Stock Level Table */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 bg-slate-50/40 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-[14px] font-black text-slate-900">Warehouse Inventory Status</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Real-time stock balance & availability</p>
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      {(productData?.inventoryRemaining || []).length} Products Cataloged
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px]">
                      <thead className="bg-slate-50/60 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3">Product Name</th>
                          <th className="px-4 py-3">Brand</th>
                          <th className="px-4 py-3 text-center">Current Stock</th>
                          <th className="px-4 py-3 text-center">Reserved</th>
                          <th className="px-4 py-3 text-center">Available</th>
                          <th className="px-5 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {(productData?.inventoryRemaining || []).slice(0, 10).map((item) => (
                          <tr key={item.productId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-bold text-slate-900">{item.name}</td>
                            <td className="px-4 py-3 text-slate-500">{item.brand || '—'}</td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800">{item.currentStock}</td>
                            <td className="px-4 py-3 text-center text-amber-600">{item.reservedStock}</td>
                            <td className="px-4 py-3 text-center text-emerald-600 font-bold">{item.availableStock}</td>
                            <td className="px-5 py-3 text-right">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                  item.currentStock > 5
                                    ? 'text-emerald-600 bg-emerald-50'
                                    : item.currentStock > 0
                                    ? 'text-amber-600 bg-amber-50'
                                    : 'text-red-500 bg-red-50'
                                }`}
                              >
                                {item.currentStock > 5 ? 'In Stock' : item.currentStock > 0 ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 4: CATEGORIES & PAYMENTS */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Category Performance Breakdown */}
                  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-[14.5px] font-black text-slate-900">Category Revenue Breakdown</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Income share per product category</p>
                      </div>
                      <span className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Total {formatCurrency(categoryData?.totalRevenue || 0)}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(categoryData?.categoryStats || []).map((cat) => (
                        <HorizontalBar
                          key={cat.categoryId}
                          label={cat.name}
                          value={cat.revenue}
                          total={categoryData?.totalRevenue || 1}
                          color={cat.color || '#3b82f6'}
                          formattedValue={formatCurrency(cat.revenue)}
                          subtitle={`${cat.unitsSold} units sold • ${cat.share}% Market Share`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Payment Gateway Analytics */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h2 className="text-[14.5px] font-black text-slate-900">Payment Gateways</h2>
                          <p className="text-[11px] text-slate-400 font-medium">Transactions distribution</p>
                        </div>
                        <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Live Sync
                        </span>
                      </div>
                    </div>

                    <DonutChart
                      items={Object.entries(dashboardData?.paymentSummary || {}).map(([method, count], idx) => {
                        const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
                        return {
                          name: method,
                          value: count,
                          color: colors[idx % colors.length],
                        };
                      })}
                      centerTitle={`${(dashboardData?.completedOrders || 0) + (dashboardData?.pendingOrders || 0)}`}
                      centerSubtitle="Total Payments"
                    />

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span>Coupons Applied: {dashboardData?.coupons || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* TAB 5: SYSTEM HEALTH */}
            {/* ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'health' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Server className="w-5 h-5 text-blue-600" />
                        <h2 className="text-[16px] font-black text-slate-900">Microservices Health Monitor</h2>
                      </div>
                      <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                        Live connection latency & system status across backend microservices
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
                      <Zap className="w-3.5 h-3.5" />
                      <span>AWS API Gateway Connected</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(healthData?.connectedServices || []).map((srv, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-3 hover:border-slate-200 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-black text-slate-900">{srv.service}</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        <div className="flex items-baseline justify-between text-[11px] font-semibold">
                          <span className="text-slate-400">Response Latency</span>
                          <span className="text-slate-900 font-mono font-bold">{srv.responseTimeMs} ms</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10.5px]">
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                            {srv.status}
                          </span>
                          <span className="text-slate-400 font-mono">Port HTTP Keep-Alive</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-[11.5px] font-medium">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Decoupled READ-ONLY Aggregation Strategy Active</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[10.5px]">
                      Version {healthData?.version || '1.0.0'} • AWS Region ap-southeast-1
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
