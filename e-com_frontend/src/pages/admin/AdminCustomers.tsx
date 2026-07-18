import React, { useState } from 'react';
import { CustomersTableSkeleton, CustomerStatCardSkeleton } from '../../components/admin/AdminSkeletons';
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
} from 'lucide-react';

const customers = [
  { id: 'C001', name: 'Jane Doe', email: 'jane@example.com', phone: '+91 98765 43210', initials: 'JD', color: 'from-blue-400 to-cyan-400', orders: 12, spent: '₹18,24,560', joined: '10 Jan 2025', status: 'Active' },
  { id: 'C002', name: 'Mark Smith', email: 'mark@example.com', phone: '+91 87654 32109', initials: 'MS', color: 'from-violet-400 to-purple-500', orders: 5, spent: '₹6,50,990', joined: '22 Mar 2025', status: 'Active' },
  { id: 'C003', name: 'Lisa Wong', email: 'lisa@example.com', phone: '+91 76543 21098', initials: 'LW', color: 'from-amber-400 to-orange-400', orders: 8, spent: '₹9,89,700', joined: '05 Feb 2025', status: 'Active' },
  { id: 'C004', name: 'Raj Patel', email: 'raj@example.com', phone: '+91 65432 10987', initials: 'RP', color: 'from-emerald-400 to-teal-400', orders: 3, spent: '₹2,14,397', joined: '18 Apr 2026', status: 'Active' },
  { id: 'C005', name: 'Sarah Kim', email: 'sarah@example.com', phone: '+91 54321 09876', initials: 'SK', color: 'from-pink-400 to-rose-400', orders: 1, spent: '₹3,999', joined: '14 Jul 2026', status: 'New' },
  { id: 'C006', name: 'Tom Chen', email: 'tom@example.com', phone: '+91 43210 98765', initials: 'TC', color: 'from-indigo-400 to-blue-500', orders: 0, spent: '₹0', joined: '13 Jul 2026', status: 'Inactive' },
];

const CustomerStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-650 border border-emerald-100 flex-shrink-0">
        <CheckCircle className="w-2.5 h-2.5" />
        <span>Active</span>
      </span>
    );
  }
  if (status === 'New') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
        <UserPlus className="w-2.5 h-2.5 animate-pulse" />
        <span>New</span>
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

// --- Compact Customer KPI Card ---
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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 350);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-5 sm:p-7 space-y-6">
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[12px] font-bold text-blue-600 tracking-wider uppercase">CRM Hub</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Customers</h1>
            <p className="text-[12.5px] text-slate-550 font-medium mt-0.5">
              Manage and view your user base, spending logs and details
            </p>
          </div>
          <button className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-blue-600/25 active:scale-95 self-start sm:self-auto cursor-pointer">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* KPI stats summary block */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <CustomerStatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CustomerStatCard
              label="Total Customers"
              value="12.4k Users"
              icon={<Users className="w-4.5 h-4.5" />}
              iconBgColor="bg-blue-50 text-blue-600"
            />
            <CustomerStatCard
              label="Active This Month"
              value="8.2k Users"
              icon={<CheckCircle className="w-4.5 h-4.5" />}
              iconBgColor="bg-emerald-50 text-emerald-600"
            />
            <CustomerStatCard
              label="New This Week"
              value="142 Joins"
              icon={<UserPlus className="w-4.5 h-4.5" />}
              iconBgColor="bg-purple-50 text-purple-600"
            />
          </div>
        )}

        {/* Search Input Filter */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search customers..."
            className="w-full h-9 pl-9 pr-4 bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-slate-355 focus:bg-slate-50/80 focus:border-blue-650 focus:ring-4 focus:ring-blue-600/10 focus:outline-none rounded-xl text-[12px] text-slate-700 placeholder-slate-400 font-medium transition-all duration-200"
          />
        </div>

        {/* Customers Panel List */}
        {loading ? (
          <CustomersTableSkeleton />
        ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col pt-1 relative">
          {/* Refreshing bar */}
          {isRefreshing && (
            <div className="w-full h-0.5 bg-blue-100 relative overflow-hidden z-10">
              <div className="absolute top-0 left-0 h-full bg-blue-600 w-1/3 rounded-full" style={{ animation: 'loadingBar 1s linear infinite' }} />
            </div>
          )}
          {/* Header Row */}
          <div className="hidden sm:grid sm:grid-cols-12 items-center border-b border-slate-100 px-5 py-3 bg-slate-50/20 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Customer Profile</div>
            <div className="col-span-3 pl-2">Contact Details</div>
            <div className="col-span-2 pl-2">Joined Date</div>
            <div className="col-span-1 pl-2">Orders</div>
            <div className="col-span-2 pl-2">Total Spend</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          <div className="relative p-3 sm:p-4 bg-white min-h-[250px]">
            {isRefreshing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 p-3 sm:p-4 space-y-2 sm:space-y-2.5 pointer-events-none">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center p-3 sm:p-2.5 rounded-xl border border-slate-55 bg-white"
                  >
                    {/* 1. Customer Profile */}
                    <div className="col-span-3 flex items-center space-x-2.5 w-full">
                      <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="h-3.5 bg-slate-200 animate-pulse rounded w-4/5" />
                        <div className="h-2.5 bg-slate-200 animate-pulse rounded w-3/5" />
                      </div>
                    </div>

                    {/* 2. Contact Details */}
                    <div className="col-span-3 sm:pl-2">
                      <div className="h-3.5 bg-slate-200 animate-pulse rounded w-32" />
                    </div>

                    {/* 3. Joined Date */}
                    <div className="col-span-2 sm:pl-2">
                      <div className="h-3.5 bg-slate-200 animate-pulse rounded w-20" />
                    </div>

                    {/* 4. Orders */}
                    <div className="col-span-1 sm:pl-2">
                      <div className="h-3.5 bg-slate-200 animate-pulse rounded w-8" />
                    </div>

                    {/* 5. Total Spend */}
                    <div className="col-span-2 sm:pl-2">
                      <div className="h-4 bg-slate-200 animate-pulse rounded w-20" />
                    </div>

                    {/* 6. Status */}
                    <div className="col-span-1 flex justify-end">
                      <div className="h-5 bg-slate-200 animate-pulse rounded-full w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={`space-y-2 sm:space-y-2.5 transition-opacity duration-205 ${isRefreshing ? 'opacity-30 pointer-events-none' : ''}`}>
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center p-3.5 sm:p-2.5 rounded-xl border border-slate-100 hover:border-blue-150 hover:bg-slate-50/40 transition-all duration-200 cursor-pointer gap-2.5 sm:gap-0"
                >
                  {/* 1. Customer: col-span-3 */}
                  <div className="col-span-3 flex items-center space-x-2.5 w-full sm:w-auto">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 shadow-sm`}>
                      {c.initials}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-[12.5px] font-bold text-slate-800 leading-tight truncate">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">
                        {c.email}
                      </div>
                    </div>
                  </div>

                  {/* 2. Contact Details: col-span-3 */}
                  <div className="col-span-3 flex items-center space-x-1.5 text-[12px] text-slate-550 font-semibold sm:pl-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>

                  {/* 3. Joined Date: col-span-2 */}
                  <div className="col-span-2 flex items-center space-x-1.5 text-[11px] text-slate-455 font-bold sm:pl-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.joined}</span>
                  </div>

                  {/* 4. Orders: col-span-1 */}
                  <div className="col-span-1 flex items-center space-x-1.5 text-[12px] font-extrabold text-slate-800 sm:pl-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.orders}</span>
                  </div>

                  {/* 5. Spend: col-span-2 */}
                  <div className="col-span-2 flex items-center space-x-1.5 text-[12px] font-extrabold text-slate-800 sm:pl-2">
                    <Wallet className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.spent}</span>
                  </div>

                  {/* 6. Status & Actions: col-span-1 */}
                  <div className="col-span-1 flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto text-right">
                    <CustomerStatusBadge status={c.status} />
                    <ChevronRight className="w-4 h-4 text-slate-350 hover:text-slate-655 transition-colors" />
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="w-12 h-12 text-slate-200 mb-2" />
                  <div className="text-[13px] font-bold text-slate-500">No customers found.</div>
                  <div className="text-[11px] text-slate-400">Search patterns don't match any record.</div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
