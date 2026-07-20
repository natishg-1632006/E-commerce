import React, { useState, useEffect } from 'react';
import { CustomersTableSkeleton, CustomerStatCardSkeleton, DetailPageSkeleton } from '../../components/admin/AdminSkeletons';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  Search,
  UserPlus,
  Phone,
  Calendar,
  ShoppingBag,
  Wallet,
  CheckCircle,
  XCircle,
  ChevronRight,
  Users,
  ArrowLeft,
  Edit2,
  AlertTriangle,
  Loader2,
  MapPin,
  Mail,
  User,
  ExternalLink,
  ChevronLeft,
  Filter,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import { customerService } from '../../services/customer.service';
import type { Customer } from '../../services/customer.service';
import { orderService } from '../../services/order.service';
import type { Order } from '../../services/order.service';
import { analyticsService } from '../../services/analytics.service';
import type { SalesGrowthAnalyticsData } from '../../services/analytics.service';
import {
  WeeklySalesLogChart,
  PeakOrderHoursChart,
  TopSellingProductsBarChart,
  MonthlySalesLogChart,
} from '../../components/admin/SalesGrowthCharts';
import { TrendingUp } from 'lucide-react';

const CustomerStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const norm = (status || '').trim().toLowerCase();
  if (norm === 'active') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-650 border border-emerald-100 flex-shrink-0">
        <CheckCircle className="w-2.5 h-2.5" />
        <span>Active</span>
      </span>
    );
  }
  if (norm === 'blocked') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 flex-shrink-0">
        <Lock className="w-2.5 h-2.5" />
        <span>Blocked</span>
      </span>
    );
  }
  if (norm === 'suspended') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
        <AlertTriangle className="w-2.5 h-2.5" />
        <span>Suspended</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200 flex-shrink-0">
      <XCircle className="w-2.5 h-2.5" />
      <span>Inactive</span>
    </span>
  );
};

// --- Customer KPI Card ---
interface CustomerStatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor: string;
}

const CustomerStatCard: React.FC<CustomerStatCardProps> = ({ label, value, icon, iconBgColor }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-[16px] p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="text-2xl font-black text-slate-800 mt-0.5 leading-none">{value}</div>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
        {icon}
      </div>
    </div>
  );
};

const AdminCustomers: React.FC = () => {
  // Lists & filters states
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Blocked' | 'Suspended'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Status check loading flags
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Selected customer & details states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive' | 'Blocked' | 'Suspended'>('Active');
  const [editAddrName, setEditAddrName] = useState('');
  const [editAddrPhone, setEditAddrPhone] = useState('');
  const [editAddrStreet, setEditAddrStreet] = useState('');
  const [editAddrCity, setEditAddrCity] = useState('');
  const [editAddrState, setEditAddrState] = useState('');
  const [editAddrPincode, setEditAddrPincode] = useState('');

  // Modals & confirmation triggers
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingStatusConfirm, setPendingStatusConfirm] = useState<{
    userId: string;
    status: 'Active' | 'Inactive' | 'Blocked' | 'Suspended';
  } | null>(null);

  // Stats calculation maps
  const [customerOrdersMap, setCustomerOrdersMap] = useState<Record<string, { count: number; spent: number }>>({});
  const [activeViewTab, setActiveViewTab] = useState<'directory' | 'sales_intelligence'>('directory');
  const [salesGrowthData, setSalesGrowthData] = useState<SalesGrowthAnalyticsData | null>(null);

  useEffect(() => {
    analyticsService.getSalesGrowthAnalytics().then(setSalesGrowthData).catch(console.error);
  }, []);
  
  // Action state flags
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadOrdersForStats = async () => {
    try {
      const res = await orderService.getOrders({ limit: 1000 });
      const orders = res.orders || [];
      const statsMap: Record<string, { count: number; spent: number }> = {};
      orders.forEach(o => {
        const uid = o.userId || o.customerInfo?.userId;
        if (uid) {
          if (!statsMap[uid]) {
            statsMap[uid] = { count: 0, spent: 0 };
          }
          statsMap[uid].count += 1;
          if (o.orderStatus.toLowerCase() !== 'cancelled') {
            statsMap[uid].spent += o.totalAmount;
          }
        }
      });
      setCustomerOrdersMap(statsMap);
    } catch (err) {
      console.error('Error aggregation for orders stats:', err);
    }
  };

  const loadCustomersData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const users = await customerService.getAllCustomers();
      setCustomersList(users);
      await loadOrdersForStats();
    } catch (err: any) {
      console.error('Error loading customers:', err);
      triggerToast(err.response?.data?.message || err.message || 'Failed to fetch customer logs.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCustomersData();
  }, []);

  // Search input debounce (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, sortBy]);

  const selectCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setDetailsLoading(true);
    setIsEditing(false);
    setValidationError(null);

    // Initial sync
    setEditName(cust.fullName || '');
    setEditPhone(cust.phone || '');
    setEditStatus(cust.status || 'Active');
    setEditAddrName(cust.address?.fullName || '');
    setEditAddrPhone(cust.address?.phone || '');
    setEditAddrStreet(cust.address?.address || '');
    setEditAddrCity(cust.address?.city || '');
    setEditAddrState(cust.address?.state || '');
    setEditAddrPincode(cust.address?.pincode || '');

    try {
      const fresh = await customerService.getCustomerById(cust.userId);
      setSelectedCustomer(fresh);
      setEditName(fresh.fullName || '');
      setEditPhone(fresh.phone || '');
      setEditStatus(fresh.status || 'Active');
      setEditAddrName(fresh.address?.fullName || '');
      setEditAddrPhone(fresh.address?.phone || '');
      setEditAddrStreet(fresh.address?.address || '');
      setEditAddrCity(fresh.address?.city || '');
      setEditAddrState(fresh.address?.state || '');
      setEditAddrPincode(fresh.address?.pincode || '');

      const orderRes = await orderService.getOrders({ customerId: cust.userId });
      setRecentOrders(orderRes.orders || []);
    } catch (err) {
      console.error('Error fetching details:', err);
      triggerToast('Failed to load profile details from server.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditBackClick = () => {
    const dirty =
      editName !== (selectedCustomer?.fullName || '') ||
      editPhone !== (selectedCustomer?.phone || '') ||
      editStatus !== (selectedCustomer?.status || 'Active') ||
      editAddrName !== (selectedCustomer?.address?.fullName || '') ||
      editAddrPhone !== (selectedCustomer?.address?.phone || '') ||
      editAddrStreet !== (selectedCustomer?.address?.address || '') ||
      editAddrCity !== (selectedCustomer?.address?.city || '') ||
      editAddrState !== (selectedCustomer?.address?.state || '') ||
      editAddrPincode !== (selectedCustomer?.address?.pincode || '');

    if (dirty) {
      setShowDiscardConfirm(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!selectedCustomer) return;
    if (!editName.trim()) {
      setValidationError('fullName cannot be empty');
      return;
    }
    if (!editPhone.trim()) {
      setValidationError('phone cannot be empty');
      return;
    }

    setIsSaving(true);
    setValidationError(null);

    const addressPayload = editAddrStreet.trim() || editAddrCity.trim() || editAddrState.trim() || editAddrPincode.trim()
      ? {
          fullName: editAddrName.trim() || editName.trim(),
          phone: editAddrPhone.trim() || editPhone.trim(),
          address: editAddrStreet.trim(),
          city: editAddrCity.trim(),
          state: editAddrState.trim(),
          pincode: editAddrPincode.trim()
        }
      : null;

    const payload: Partial<Customer> = {
      fullName: editName.trim(),
      phone: editPhone.trim(),
      status: editStatus,
      address: addressPayload
    };

    try {
      await customerService.updateCustomer(selectedCustomer.userId, payload);
      triggerToast('Customer updated successfully.');
      setIsEditing(false);
      await selectCustomer({ ...selectedCustomer, ...payload });
      await loadCustomersData(true);
    } catch (err: any) {
      console.error('Error saving changes:', err);
      let errorMsg = 'Failed to update user profile.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMsg = err.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
      } else {
        errorMsg = err.response?.data?.message || err.message || errorMsg;
      }
      setValidationError(errorMsg);
      triggerToast(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerStatusChangeConfirm = (status: 'Active' | 'Inactive' | 'Blocked' | 'Suspended') => {
    if (!selectedCustomer) return;
    setPendingStatusConfirm({
      userId: selectedCustomer.userId,
      status
    });
  };

  const executeStatusChange = async () => {
    if (!pendingStatusConfirm || !selectedCustomer) return;
    setIsUpdatingStatus(true);
    const { userId, status } = pendingStatusConfirm;
    setPendingStatusConfirm(null);
    try {
      await customerService.updateCustomerStatus(userId, status);
      triggerToast('Customer status updated successfully.');
      setSelectedCustomer(prev => prev ? { ...prev, status } : null);
      setEditStatus(status);
      await loadCustomersData(true);
    } catch (err: any) {
      console.error('Error updating status:', err);
      triggerToast(err.response?.data?.message || err.message || 'Failed to update user status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'CU';
  };

  const getAvatarColor = (userId: string) => {
    const gradients = [
      'from-blue-400 to-cyan-400',
      'from-violet-400 to-purple-500',
      'from-amber-400 to-orange-400',
      'from-emerald-400 to-teal-400',
      'from-pink-400 to-rose-400',
      'from-indigo-400 to-blue-500',
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
  };

  const getCustomerSpent = (userId: string) => {
    const stats = customerOrdersMap[userId];
    if (!stats || !stats.spent) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.spent);
  };

  const getCustomerOrdersCount = (userId: string) => {
    const stats = customerOrdersMap[userId];
    return stats ? stats.count : 0;
  };

  // Aggregated dynamic stats computation
  const totalCustomers = customersList.length;
  const activeCustomers = customersList.filter(c => (c.status || 'Active').toLowerCase() === 'active').length;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomers = customersList.filter(c => new Date(c.createdAt || 0).getTime() >= thirtyDaysAgo.getTime()).length;

  // Search filter and sorting
  const filteredCustomers = customersList.filter(c => {
    const matchesSearch = 
      (c.email || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (c.fullName || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (c.userId || '').toLowerCase().includes(debouncedSearch.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'All' || 
      (c.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
      
    return matchesSearch && matchesStatus;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedCustomers.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedCustomers = sortedCustomers.slice(indexOfFirstRow, indexOfLastRow);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <AdminLayout>
      <div className="p-5 sm:p-7 space-y-6 relative">
        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white text-[12px] font-bold px-4 py-3 rounded-xl shadow-lg border border-slate-850 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-450 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {!selectedCustomer ? (
          /* ================= CUSTOMERS LIST VIEW ================= */
          <>
            {/* Page Header */}
            <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-[12px] font-bold text-blue-600 tracking-wider uppercase">CRM Hub</div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Customers & Sales Intelligence</h1>
                <p className="text-[12.5px] text-slate-550 font-medium mt-0.5">
                  Manage user base, analyze customer buying patterns and peak order hours
                </p>
              </div>

              {/* View Tab Switcher */}
              <div className="bg-slate-100 p-1 rounded-2xl flex items-center space-x-1 self-start sm:self-auto">
                <button
                  onClick={() => setActiveViewTab('directory')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeViewTab === 'directory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Customer Directory</span>
                </button>
                <button
                  onClick={() => setActiveViewTab('sales_intelligence')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeViewTab === 'sales_intelligence' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Sales Behavior & Peak Hours</span>
                </button>
              </div>
            </div>

            {activeViewTab === 'sales_intelligence' ? (
              <div className="space-y-6 animate-fadeIn pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <PeakOrderHoursChart timeSlots={salesGrowthData?.peakOrderHours} />
                  <TopSellingProductsBarChart products={salesGrowthData?.topSellingProductsRanked} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <WeeklySalesLogChart data={salesGrowthData?.weeklySalesLog} />
                  <MonthlySalesLogChart data={salesGrowthData?.monthlySalesLog} />
                </div>
              </div>
            ) : (
              <React.Fragment>

            {/* KPI Statistics block */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <CustomerStatCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CustomerStatCard
                  label="Total Customers"
                  value={`${totalCustomers} Users`}
                  icon={<Users className="w-4.5 h-4.5" />}
                  iconBgColor="bg-blue-50 text-blue-600"
                />
                <CustomerStatCard
                  label="Active Customers"
                  value={`${activeCustomers} Users`}
                  icon={<CheckCircle className="w-4.5 h-4.5" />}
                  iconBgColor="bg-emerald-50 text-emerald-600"
                />
                <CustomerStatCard
                  label="New Customers (30d)"
                  value={`${newCustomers} Joins`}
                  icon={<UserPlus className="w-4.5 h-4.5" />}
                  iconBgColor="bg-purple-50 text-purple-600"
                />
              </div>
            )}

            {/* Search, Filter & Sort Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full h-9 pl-9 pr-4 bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-slate-355 focus:bg-slate-50/80 focus:border-blue-650 focus:ring-4 focus:ring-blue-600/10 focus:outline-none rounded-xl text-[12px] text-slate-700 placeholder-slate-400 font-semibold transition-all"
                />
              </div>

              {/* Filtering / Sorting Controls */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="h-9 px-3 bg-white border border-slate-200 focus:border-blue-600 focus:outline-none rounded-xl text-[11.5px] font-bold text-slate-655 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="h-9 px-3 bg-white border border-slate-200 focus:border-blue-600 focus:outline-none rounded-xl text-[11.5px] font-bold text-slate-655 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customers Panel list view */}
            {loading ? (
              <CustomersTableSkeleton />
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col pt-1 relative">
                {/* Refresh loading bar */}
                {isRefreshing && (
                  <div className="w-full h-0.5 bg-blue-100 relative overflow-hidden z-10">
                    <div className="absolute top-0 left-0 h-full bg-blue-600 w-1/3 rounded-full" style={{ animation: 'loadingBar 1s linear infinite' }} />
                  </div>
                )}
                {/* Headers */}
                <div className="hidden sm:grid sm:grid-cols-12 items-center border-b border-slate-100 px-5 py-3 bg-slate-50/20 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">
                  <div className="col-span-3">Customer Profile</div>
                  <div className="col-span-3 pl-2">Contact Details</div>
                  <div className="col-span-2 pl-2">Joined Date</div>
                  <div className="col-span-1 pl-2">Orders</div>
                  <div className="col-span-2 pl-2">Total Spend</div>
                  <div className="col-span-1 text-right">Status</div>
                </div>

                <div className="relative p-3 sm:p-4 bg-white min-h-[250px]">
                  <div className={`space-y-2 sm:space-y-2.5 transition-opacity duration-205 ${isRefreshing ? 'opacity-30 pointer-events-none' : ''}`}>
                    {paginatedCustomers.map((c) => (
                      <div
                        key={c.userId}
                        onClick={() => selectCustomer(c)}
                        className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center p-3.5 sm:p-2.5 rounded-xl border border-slate-100 hover:border-blue-150 hover:bg-slate-50/40 transition-all duration-200 cursor-pointer gap-2.5 sm:gap-0"
                      >
                        {/* 1. Profile initials / text */}
                        <div className="col-span-3 flex items-center space-x-2.5 w-full sm:w-auto text-left">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(c.userId)} flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-sm`}>
                            {getInitials(c.fullName, c.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-bold text-slate-800 leading-tight truncate">
                              {c.fullName || 'No Name Registered'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">
                              {c.email}
                            </div>
                          </div>
                        </div>

                        {/* 2. Contact details */}
                        <div className="col-span-3 flex items-center space-x-1.5 text-[12px] text-slate-550 font-semibold sm:pl-2 text-left">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.phone || 'No phone'}</span>
                        </div>

                        {/* 3. Joined Date */}
                        <div className="col-span-2 flex items-center space-x-1.5 text-[11px] text-slate-455 font-bold sm:pl-2 text-left">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>

                        {/* 4. Orders */}
                        <div className="col-span-1 flex items-center space-x-1.5 text-[12px] font-extrabold text-slate-800 sm:pl-2 text-left">
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getCustomerOrdersCount(c.userId)}</span>
                        </div>

                        {/* 5. Spend */}
                        <div className="col-span-2 flex items-center space-x-1.5 text-[12px] font-extrabold text-slate-800 sm:pl-2 text-left">
                          <Wallet className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getCustomerSpent(c.userId)}</span>
                        </div>

                        {/* 6. Status and chevron */}
                        <div className="col-span-1 flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto text-right">
                          <CustomerStatusBadge status={c.status || 'Active'} />
                          <ChevronRight className="w-4 h-4 text-slate-350 hover:text-slate-655 transition-colors" />
                        </div>
                      </div>
                    ))}

                    {/* Empty search results block */}
                    {filteredCustomers.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="w-12 h-12 text-slate-200 mb-2" />
                        <div className="text-[13px] font-bold text-slate-500">No customers found.</div>
                        <div className="text-[11px] text-slate-400">Search filter criteria returned empty results.</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                  <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/10">
                    <div className="text-[11px] font-bold text-slate-455">
                      Showing <span className="text-slate-700">{indexOfFirstRow + 1}</span> to{' '}
                      <span className="text-slate-700">{Math.min(indexOfLastRow, sortedCustomers.length)}</span> of{' '}
                      <span className="text-slate-700">{sortedCustomers.length}</span> Customers
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11.5px] font-extrabold text-slate-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        )}
      </>
    ) : (
          /* ================= CUSTOMER WORKSPACE VIEW ================= */
          <div className="space-y-6 animate-fadeIn">
            {/* Header / Back navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="flex items-center space-x-2 text-[12px] font-bold text-blue-600 hover:text-blue-750 transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Customer List</span>
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarColor(selectedCustomer.userId)} flex items-center justify-center text-white text-[12px] font-black shadow-sm`}>
                      {getInitials(selectedCustomer.fullName, selectedCustomer.email)}
                    </div>
                    <div className="text-left">
                      <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
                        {selectedCustomer.fullName || 'No Name Registered'}
                      </h1>
                      <div className="text-[11px] text-slate-400 font-semibold leading-none mt-0.5">
                        {selectedCustomer.email}
                      </div>
                    </div>
                  </div>
                  <CustomerStatusBadge status={selectedCustomer.status || 'Active'} />
                </div>
              </div>

              {/* Action buttons */}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {detailsLoading ? (
              <DetailPageSkeleton columns={2} />
            ) : isEditing ? (
              /* ================= EDIT CUSTOMER PROFILE VIEW ================= */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form fields */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Personal Information card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 text-left animate-slideDown">
                    <h3 className="text-[13.5px] font-black text-slate-900">Personal & Contact Details</h3>
                    {validationError && (
                      <div className="p-3 bg-red-50 border border-red-200/40 rounded-xl flex items-center space-x-2 text-red-655 text-[11.5px] font-bold">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 animate-bounce" />
                        <span>{validationError}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Full Name</span>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-650 focus:ring-4 focus:ring-blue-600/10 focus:outline-none rounded-xl text-[12.5px] font-semibold text-slate-700 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Phone Number</span>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-655 focus:ring-4 focus:ring-blue-600/10 focus:outline-none rounded-xl text-[12.5px] font-semibold text-slate-700 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address information card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 text-left animate-slideDown">
                    <h3 className="text-[13.5px] font-black text-slate-900">Registered Shipping Address</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Recipient Name</span>
                          <input
                            type="text"
                            value={editAddrName}
                            onChange={e => setEditAddrName(e.target.value)}
                            placeholder="Same as profile if blank"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-650 focus:outline-none rounded-xl text-[12.5px] font-semibold text-slate-750 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Contact Phone</span>
                          <input
                            type="text"
                            value={editAddrPhone}
                            onChange={e => setEditAddrPhone(e.target.value)}
                            placeholder="Same as profile if blank"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-650 focus:outline-none rounded-xl text-[12.5px] font-semibold text-slate-750 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Street Address</span>
                        <input
                          type="text"
                          value={editAddrStreet}
                          onChange={e => setEditAddrStreet(e.target.value)}
                          placeholder="123 Main Road, Building A"
                          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-650 focus:outline-none rounded-xl text-[12.5px] font-semibold text-slate-750 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">City</span>
                          <input
                            type="text"
                            value={editAddrCity}
                            onChange={e => setEditAddrCity(e.target.value)}
                            placeholder="Mumbai"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-650 focus:outline-none rounded-xl text-[12.5px] font-semibold text-slate-750 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">State</span>
                          <input
                            type="text"
                            value={editAddrState}
                            onChange={e => setEditAddrState(e.target.value)}
                            placeholder="Maharashtra"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-650 focus:outline-none rounded-xl text-[12.5px] font-semibold text-slate-750 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Pincode</span>
                          <input
                            type="text"
                            value={editAddrPincode}
                            onChange={e => setEditAddrPincode(e.target.value)}
                            placeholder="400001"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-650 focus:outline-none rounded-xl text-[12.5px] font-semibold text-slate-750 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel / Save triggers */}
                  <div className="flex justify-end items-center space-x-3 pt-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleEditBackClick}
                      className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-655 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveCustomer}
                      className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-extrabold shadow-md shadow-blue-600/25 active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>

                {/* Edit details sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Status update sidebar card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                    <h3 className="text-[13.5px] font-black text-slate-900">User Account Status</h3>
                    <div className="space-y-3">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">Status Type</span>
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value as any)}
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-none rounded-xl text-[12.5px] font-bold text-slate-700 transition-all cursor-pointer"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Blocked">Blocked</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold leading-relaxed pl-1">
                        Changing status may restrict customer access to native mobile apps and checkout features.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= READ DETAILS VIEW ================= */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
                {/* Profile detailed columns */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Profile properties */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4.5 text-left">
                    <h3 className="text-[13.5px] font-black text-slate-900 border-b border-slate-50 pb-2">Customer Profile Summary</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 text-[12.5px] text-slate-655 font-semibold">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9.5px] uppercase font-extrabold leading-none">Full Name</span>
                          <span className="text-slate-800 font-bold block mt-1">{selectedCustomer.fullName || 'No Name Registered'}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9.5px] uppercase font-extrabold leading-none">Email Address</span>
                          <span className="text-slate-800 font-bold block mt-1 truncate max-w-[200px]">{selectedCustomer.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9.5px] uppercase font-extrabold leading-none">Contact Phone</span>
                          <span className="text-slate-800 font-bold block mt-1">{selectedCustomer.phone || 'No Phone Registered'}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9.5px] uppercase font-extrabold leading-none">Joined Date</span>
                          <span className="text-slate-800 font-bold block mt-1">
                            {new Date(selectedCustomer.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Summary */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                    <h3 className="text-[13.5px] font-black text-slate-900 border-b border-slate-50 pb-2">Shipping Information</h3>
                    {selectedCustomer.address ? (
                      <div className="space-y-3.5 text-[12.5px] text-slate-655 font-semibold">
                        <div className="flex items-start space-x-2.5">
                          <MapPin className="w-4.5 h-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            <div className="font-bold text-slate-800">
                              {selectedCustomer.address.fullName || selectedCustomer.fullName}
                            </div>
                            <div className="text-[12px] text-slate-550">
                              {selectedCustomer.address.address}
                            </div>
                            <div className="text-[12px] text-slate-550">
                              {selectedCustomer.address.city}, {selectedCustomer.address.state} -{' '}
                              <strong className="text-slate-700">{selectedCustomer.address.pincode}</strong>
                            </div>
                            {selectedCustomer.address.phone && (
                              <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-1">
                                <Phone className="w-3 h-3" />
                                <span>{selectedCustomer.address.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                        <MapPin className="w-8 h-8 text-slate-200" />
                        <div>
                          <div className="text-[12.5px] font-bold text-slate-600">No Address Registered</div>
                          <div className="text-[11px] text-slate-400">The customer has not registered a shipping profile yet.</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Orders table */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4.5 text-left">
                    <h3 className="text-[13.5px] font-black text-slate-900 border-b border-slate-50 pb-2">Recent Orders</h3>
                    {recentOrders.length > 0 ? (
                      <div className="overflow-x-auto w-full border border-slate-100 rounded-xl">
                        <table className="w-full border-collapse text-left text-[12.5px] text-slate-655">
                          <thead>
                            <tr className="bg-slate-50/60 border-b border-slate-150 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              <th className="px-4 py-2.5">Order ID</th>
                              <th className="px-4 py-2.5">Date</th>
                              <th className="px-4 py-2.5">Total Amount</th>
                              <th className="px-4 py-2.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map(o => (
                              <tr key={o.orderId} className="border-b border-slate-50 hover:bg-slate-50/30">
                                <td className="px-4 py-2.5 font-bold text-blue-600 flex items-center space-x-1.5">
                                  <span>{o.orderId.substring(0, 8)}</span>
                                  <a href={`/orders`} className="text-slate-400 hover:text-blue-600">
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </td>
                                <td className="px-4 py-2.5 text-[11.5px] text-slate-500">
                                  {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-2.5 font-extrabold text-slate-800">
                                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(o.totalAmount)}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <span className="inline-flex px-2 py-0.5 text-[9.5px] font-bold rounded-full bg-slate-100 text-slate-650">
                                    {o.orderStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                        <ShoppingBag className="w-8 h-8 text-slate-200" />
                        <div>
                          <div className="text-[12.5px] font-bold text-slate-600">No Orders Registered</div>
                          <div className="text-[11px] text-slate-400">This account hasn't made any purchases.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar details */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Spending summary */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                    <h3 className="text-[13.5px] font-black text-slate-900">CRM Spending Logs</h3>
                    <div className="border-t border-slate-50 pt-2 text-[12.5px] text-slate-655 font-semibold space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Purchase Log:</span>
                        <span className="text-slate-800 font-bold">{getCustomerOrdersCount(selectedCustomer.userId)} Orders</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aggregated Spent:</span>
                        <span className="text-blue-650 font-black">{getCustomerSpent(selectedCustomer.userId)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                        <span>Last Updated profile:</span>
                        <span>{new Date(selectedCustomer.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick status actions panel */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                    <h3 className="text-[13.5px] font-black text-slate-900">Account Access Rules</h3>
                    <div className="space-y-2 flex flex-col pt-1">
                      <span className="text-[9.5px] font-black uppercase text-slate-400 pl-1">Toggle Customer Status</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-[11.5px] font-bold">
                        <button
                          type="button"
                          disabled={isUpdatingStatus || (selectedCustomer.status || 'Active') === 'Active'}
                          onClick={() => triggerStatusChangeConfirm('Active')}
                          className="h-9 rounded-xl border border-emerald-250 text-emerald-700 bg-emerald-50/20 hover:bg-emerald-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          🟢 Set Active
                        </button>
                        <button
                          type="button"
                          disabled={isUpdatingStatus || selectedCustomer.status === 'Inactive'}
                          onClick={() => triggerStatusChangeConfirm('Inactive')}
                          className="h-9 rounded-xl border border-slate-250 text-slate-600 bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          ⚪ Set Inactive
                        </button>
                        <button
                          type="button"
                          disabled={isUpdatingStatus || selectedCustomer.status === 'Blocked'}
                          onClick={() => triggerStatusChangeConfirm('Blocked')}
                          className="h-9 rounded-xl border border-red-250 text-red-650 bg-red-50/25 hover:bg-red-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          🔴 Set Blocked
                        </button>
                        <button
                          type="button"
                          disabled={isUpdatingStatus || selectedCustomer.status === 'Suspended'}
                          onClick={() => triggerStatusChangeConfirm('Suspended')}
                          className="h-9 rounded-xl border border-amber-250 text-amber-700 bg-amber-50/25 hover:bg-amber-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          🟡 Set Suspended
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Confirmation Modal */}
        {pendingStatusConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4 text-left">
              <div className="flex items-center space-x-2.5 text-amber-500">
                <AlertTriangle className="w-5.5 h-5.5 animate-pulse" />
                <h3 className="text-[14px] font-black text-slate-900 leading-tight">Change User Status?</h3>
              </div>
              
              <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                Are you sure you want to transition this account status to <strong className="text-slate-800 uppercase">{pendingStatusConfirm.status}</strong>?
              </p>

              <div className="flex items-center space-x-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setPendingStatusConfirm(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-[12px] font-bold text-slate-655 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeStatusChange}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-xl transition-all shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer"
                >
                  Confirm Status Change
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discard changes warning Modal */}
        {showDiscardConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4 text-left">
              <div className="flex items-center space-x-2.5 text-amber-500">
                <AlertTriangle className="w-5.5 h-5.5 animate-pulse" />
                <h3 className="text-[14px] font-black text-slate-900 leading-tight">Discard Profile Edits?</h3>
              </div>
              
              <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                You have unsaved changes to this customer's profile. Discarding will lose all modified entries.
              </p>

              <div className="flex items-center space-x-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-[12px] font-bold text-slate-655 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Discard Edits
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
