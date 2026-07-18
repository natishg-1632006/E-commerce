import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  User,
  Clock,
  Calendar,
  CheckCircle,
  Copy,
  Mail,
  Ban,
  Eye,
} from 'lucide-react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { orderService } from '../../services/order.service';
import type { Order } from '../../services/order.service';
import { OrdersTableSkeleton } from '../../components/admin/AdminSkeletons';

const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const formatDatetime = (iso: string | undefined) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
};

const getAvatarInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getTimeSince = (isoString: string | undefined): string => {
  if (!isoString) return '—';
  try {
    const diffMs = new Date().getTime() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Created just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } catch {
    return '—';
  }
};

export const AdminPendingPayments: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchPendingPayments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrders({ paymentStatus: 'Pending', limit: 100 });
      const filtered = (response.orders || []).filter(
        o =>
          String(o.paymentStatus || '').toUpperCase() === 'PENDING' ||
          String(o.orderStatus || '').toUpperCase() === 'PENDING_PAYMENT' ||
          String(o.orderStatus || '').toUpperCase() === 'PENDING PAYMENT'
      );
      setOrders(filtered);
      setStats(response.stats ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pending payments');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  // Actions handlers
  const handleCopyPaymentLink = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const mockLink = `https://natcart.com/checkout/pay/${orderId}`;
    navigator.clipboard.writeText(mockLink);
    triggerToast('Payment link copied to clipboard!');
  };

  const handleResendPaymentLink = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerToast(`Payment link resent to ${email || 'customer'}!`);
  };

  const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this pending payment order?')) return;
    try {
      setIsRefreshing(true);
      await orderService.updateOrderStatus(orderId, 'Cancelled');
      triggerToast('Order cancelled successfully!');
      fetchPendingPayments(true);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to cancel order.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Local calculations if backend stats are missing
  const today = new Date().toISOString().split('T')[0];
  const localTotalCount = orders.length;
  const localPendingValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const localTodayPending = orders.filter(o => (o.createdAt || '').startsWith(today)).length;
  const localExpiredPending = orders.filter(o => {
    const isExpired = o.expiresAt && new Date(o.expiresAt) < new Date();
    const ost = String(o.orderStatus || '').toUpperCase();
    return isExpired || ost === 'EXPIRED' || ost === 'PAYMENT_FAILED';
  }).length;

  const totalPendingOrders = stats?.totalPendingOrders ?? localTotalCount;
  const pendingPaymentValue = stats?.pendingPaymentValue ?? localPendingValue;
  const todaysPendingOrders = stats?.todaysPendingOrders ?? localTodayPending;
  const expiredPendingPayments = stats?.expiredPendingPayments ?? localExpiredPending;

  return (
    <AdminLayout>
      <div className="p-5 sm:p-7 space-y-6 animate-fadeIn">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-5 right-5 z-[100] flex items-center space-x-2 bg-slate-900 text-white text-[12px] font-bold px-4 py-3 rounded-xl shadow-xl border border-slate-800 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">Sales Hub</div>
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight mt-0.5">Pending Payments</h1>
            <p className="text-[12px] text-slate-400 font-semibold mt-1">
              Monitor and recover sales orders awaiting checkout payment confirmation.
            </p>
          </div>
          <button
            onClick={() => fetchPendingPayments(true)}
            disabled={loading || isRefreshing}
            className="h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-[13px] font-bold text-slate-600 rounded-[10px] flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* KPI Cards for Pending Payments (Exactly 4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-[12px] p-4 shadow-sm h-[114px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[12.5px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PENDING</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-[24px] font-black text-slate-800 leading-none">{totalPendingOrders}</div>
              <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">Awaiting checkout</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[12px] p-4 shadow-sm h-[114px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[12.5px] font-bold text-slate-400 uppercase tracking-wider">PENDING VALUE</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-[24px] font-black text-blue-600 leading-none">{formatCurrency(pendingPaymentValue)}</div>
              <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">Total value in pool</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[12px] p-4 shadow-sm h-[114px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[12.5px] font-bold text-slate-400 uppercase tracking-wider">TODAY'S PENDING</span>
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-[24px] font-black text-slate-800 leading-none">{todaysPendingOrders}</div>
              <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">Added today</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[12px] p-4 shadow-sm h-[114px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[12.5px] font-bold text-slate-400 uppercase tracking-wider">EXPIRED PAYMENTS</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-655 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-[24px] font-black text-red-600 leading-none">{expiredPendingPayments}</div>
              <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">Overdue checkout</span>
            </div>
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <OrdersTableSkeleton />
        ) : error ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[15px] font-black text-slate-800">Failed to Load Orders</div>
              <p className="text-[12px] text-slate-400 mt-1">{error}</p>
            </div>
            <button
              onClick={() => fetchPendingPayments()}
              className="px-4 py-2 bg-blue-600 text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col pt-0.5 relative">
            <style>{`@keyframes loadingBar{0%{left:-35%}100%{left:100%}}.animate-loadingBar{animation:loadingBar 1s linear infinite}`}</style>
            {isRefreshing && (
              <div className="w-full h-0.5 bg-blue-100 relative overflow-hidden z-10">
                <div className="absolute top-0 left-0 h-full bg-blue-600 animate-loadingBar w-1/3 rounded-full" />
              </div>
            )}

            {/* Table Header */}
            <div
              className="hidden xl:grid items-center border-b border-slate-100 px-5 py-3 bg-slate-50/30 text-[13px] font-semibold text-slate-400 uppercase tracking-wider"
              style={{ gridTemplateColumns: '13% 22% 12% 11% 10% 12% 14% 6%' }}
            >
              <div>Order ID</div>
              <div>Customer</div>
              <div>Amount</div>
              <div>Created Date</div>
              <div>Payment Method</div>
              <div>Payment Status</div>
              <div>Time Since Created</div>
              <div />
            </div>

            {/* Table Rows */}
            <div className={`p-1.5 sm:p-2 space-y-0.5 min-h-[120px] transition-opacity duration-200 ${isRefreshing ? 'opacity-40 pointer-events-none' : ''}`}>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[14px] font-black text-slate-700">No pending payments</div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      No orders are currently awaiting payment.
                    </p>
                  </div>
                </div>
              ) : (
                orders.map((order, rowIdx) => {
                  const displayId = order.orderId || '—';
                  const customerName = order.shippingAddress?.fullName || order.customerInfo?.fullName || 'Guest Customer';
                  const customerEmail = order.email || order.shippingAddress?.email || order.customerInfo?.email || '—';
                  const customerPhone = order.shippingAddress?.phone || order.customerInfo?.phone || '';
                  const rowKey = order.orderId || `pending-row-${rowIdx}`;
                  return (
                    <div
                      key={rowKey}
                      onClick={() => order.orderId && navigate(`/admin/orders/${order.orderId}`)}
                      className="flex flex-col xl:grid items-start xl:items-center px-5 min-h-[56px] py-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-slate-100/80 transition-all duration-200 cursor-pointer bg-white gap-2 xl:gap-0"
                      style={{ gridTemplateColumns: '13% 22% 12% 11% 10% 12% 14% 6%' }}
                    >
                      {/* Order ID */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-3 h-3" />
                        </div>
                        <span className="font-mono text-[12.5px] font-bold text-slate-800 truncate leading-none">
                          {displayId.length > 12 ? displayId.slice(0, 12) + '…' : displayId}
                        </span>
                      </div>

                      {/* Customer Info Avatar Stacked */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center flex-shrink-0 text-[11.5px] font-black text-slate-500 tracking-wider">
                          {getAvatarInitials(customerName)}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <div className="text-[13px] font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{customerName}</div>
                          <div className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">{customerEmail}</div>
                          {customerPhone && (
                            <div className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">{customerPhone}</div>
                          )}
                        </div>
                      </div>

                      {/* Amount + Items stacked */}
                      <div className="leading-tight">
                        <div className="text-[13px] font-black text-slate-900">{formatCurrency(order.totalAmount || 0)}</div>
                        <div className="text-[10.5px] text-slate-400 font-bold mt-0.5">
                          {order.items?.length ?? 0} Item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="text-[12px] text-slate-400 font-semibold leading-none flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-350 xl:hidden" />
                        <span>{formatDatetime(order.createdAt).split(' ')[0]}</span>
                      </div>

                      {/* Method */}
                      <div className="text-[12.5px] font-bold text-slate-600 leading-none">
                        {order.paymentMethod || '—'}
                      </div>

                      {/* Payment Status (dedicated orange badge) */}
                      <div>
                        <span className="inline-flex flex-col text-[11px] leading-tight">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold mt-1 text-center">Awaiting Payment</span>
                        </span>
                      </div>

                      {/* Time Since Created */}
                      <div className="text-[12px] font-bold text-amber-600 leading-none flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{getTimeSince(order.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPendingPayments;
