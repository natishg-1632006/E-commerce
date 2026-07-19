import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  Search,
  Plus,
  CheckCircle,
  Clock,
  ChevronDown,
  RefreshCw,
  Trash2,
  Check,
  ArrowLeft,
  Tag,
  Ticket,
} from 'lucide-react';
import { couponService } from '../../services/coupon.service';
import type { Coupon } from '../../services/coupon.service';
import toast from 'react-hot-toast';
import { Price } from '../../components/ui/Price';

// --- Custom Status Badge matching style guidelines ---
const CouponStatusBadge: React.FC<{ status: 'ACTIVE' | 'INACTIVE' }> = ({ status }) => {
  const baseClass = "inline-flex items-center justify-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 text-center";

  if (status === 'ACTIVE') {
    return (
      <span className={`${baseClass} bg-emerald-50 text-emerald-650 border-emerald-100`}>
        <CheckCircle className="w-3 h-3 flex-shrink-0" />
        <span>Active</span>
      </span>
    );
  }
  return (
    <span className={`${baseClass} bg-slate-50 text-slate-500 border-slate-200`}>
      <Clock className="w-3 h-3 flex-shrink-0" />
      <span>Inactive</span>
    </span>
  );
};

// --- Custom Status Dropdown inside Form fields ---
const FormStatusDropdown: React.FC<{
  selected: 'ACTIVE' | 'INACTIVE';
  disabled?: boolean;
  onSelect: (status: 'ACTIVE' | 'INACTIVE') => void;
}> = ({ selected, disabled, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'ACTIVE', label: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle },
    { value: 'INACTIVE', label: 'Inactive', color: 'text-slate-500 bg-slate-50 border-slate-100', icon: Clock },
  ];

  const selectedOpt = options.find(o => o.value === selected) || options[0];

  return (
    <div className="relative w-full text-left">
      <label className="absolute left-4.5 -top-2 z-10 text-[9.5px] bg-white px-1.5 text-blue-655 font-bold">
        Status *
      </label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between border rounded-2xl h-14 px-4 transition-all duration-200 ${
          disabled
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
            : isOpen
              ? 'bg-slate-50/80 border-blue-600 ring-4 ring-blue-600/10 shadow-sm shadow-blue-600/5 cursor-pointer'
              : 'bg-white hover:bg-slate-50/60 border-slate-200 hover:border-slate-350 shadow-sm shadow-slate-100/40 cursor-pointer'
        }`}
      >
        <div className="flex items-center space-x-2">
          <selectedOpt.icon className={`w-4 h-4 ${selectedOpt.color.split(' ')[0]}`} />
          <span className="text-[12.5px] font-bold text-slate-800">
            {selectedOpt.label}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-12.5 left-0 right-0 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 mt-1 animate-fadeIn space-y-0.5">
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value as any);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-[12px] font-bold text-slate-755 transition-colors"
              >
                <Icon className={`w-4 h-4 ${opt.color.split(' ')[0]}`} />
                <span className="flex-1">{opt.label}</span>
                {selected === opt.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Custom Discount Type Dropdown inside Form fields ---
const FormDiscountTypeDropdown: React.FC<{
  selected: 'PERCENTAGE' | 'FIXED';
  disabled?: boolean;
  onSelect: (type: 'PERCENTAGE' | 'FIXED') => void;
}> = ({ selected, disabled, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'FIXED', label: 'Fixed Amount (₹)', icon: Tag },
    { value: 'PERCENTAGE', label: 'Percentage (%)', icon: Ticket },
  ];

  const selectedOpt = options.find(o => o.value === selected) || options[0];

  return (
    <div className="relative w-full text-left">
      <label className="absolute left-4.5 -top-2 z-10 text-[9.5px] bg-white px-1.5 text-blue-655 font-bold">
        Discount Type *
      </label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between border rounded-2xl h-14 px-4 transition-all duration-200 ${
          disabled
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
            : isOpen
              ? 'bg-slate-50/80 border-blue-600 ring-4 ring-blue-600/10 shadow-sm shadow-blue-600/5 cursor-pointer'
              : 'bg-white hover:bg-slate-50/60 border-slate-200 hover:border-slate-350 shadow-sm shadow-slate-100/40 cursor-pointer'
        }`}
      >
        <div className="flex items-center space-x-2">
          <selectedOpt.icon className="w-4 h-4 text-blue-600" />
          <span className="text-[12.5px] font-bold text-slate-800">
            {selectedOpt.label}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-12.5 left-0 right-0 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 mt-1 animate-fadeIn space-y-0.5">
          {options.map(opt => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value as any);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-[12px] font-bold text-slate-755 transition-colors"
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="flex-1">{opt.label}</span>
                {selected === opt.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface AdminCouponsProps {
  mode?: 'list' | 'create' | 'edit';
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ mode = 'list' }) => {
  const { couponId } = useParams<{ couponId: string }>();
  const navigate = useNavigate();

  // List states
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListingLoading, setIsListingLoading] = useState(true);

  // Form states
  const [couponCode, setCouponCode] = useState('');
  const [couponName, setCouponName] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Form validations
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Load coupons list on mount (only for listing mode)
  const fetchCoupons = async () => {
    setIsListingLoading(true);
    try {
      const res = await couponService.getCoupons();
      const list = res.data || res.coupons || (Array.isArray(res) ? res : []);
      setCouponsList(list);
    } catch (err) {
      console.error('Error loading coupons:', err);
      toast.error('Failed to load coupons.');
    } finally {
      setIsListingLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'list') {
      fetchCoupons();
    }
  }, [mode]);

  // Load specific coupon data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && couponId) {
      const loadCouponDetails = async () => {
        setIsDetailLoading(true);
        try {
          const res = await couponService.getCouponByCode(couponId);
          const data = res.data || res.coupon || res;
          if (data) {
            setCouponCode(data.couponCode || '');
            setCouponName(data.couponName || '');
            setDiscountType(data.discountType || 'FIXED');
            setDiscountValue(data.discountValue !== undefined ? data.discountValue : '');
            setMinOrderAmount(data.minimumOrderAmount !== undefined && data.minimumOrderAmount !== null ? data.minimumOrderAmount : '');
            setExpiresAt(data.expiryDate ? data.expiryDate.split('T')[0] : '');
            setStatus(data.isActive ? 'ACTIVE' : 'INACTIVE');
          }
        } catch (err) {
          console.error('Error fetching coupon details:', err);
          toast.error('Failed to load coupon details.');
          navigate('/admin/coupons');
        } finally {
          setIsDetailLoading(false);
        }
      };
      loadCouponDetails();
    }
  }, [mode, couponId, navigate]);

  // Handle Delete coupon
  const handleDeleteCoupon = async (code: string) => {
    const ok = window.confirm(`Are you sure you want to delete coupon "${code}"?`);
    if (!ok) return;

    try {
      await couponService.deleteCoupon(code);
      toast.success(`Coupon ${code} deleted successfully`);
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      toast.error('Failed to delete coupon.');
    }
  };

  // Form validator
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!couponCode.trim()) {
      errors.couponCode = 'Coupon Code is required';
    } else if (!/^[A-Z0-9_-]+$/.test(couponCode)) {
      errors.couponCode = 'Code must be uppercase and alphanumeric only (no spaces)';
    }

    if (!couponName.trim()) {
      errors.couponName = 'Coupon Name is required';
    }

    if (discountValue === '' || Number(discountValue) <= 0) {
      errors.discountValue = 'Please enter a valid discount value greater than 0';
    }

    if (!expiresAt) {
      errors.expiresAt = 'Expiry Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit Handler
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (!validateForm()) return;

    setIsFormSubmitting(true);
    const payload: any = {
      couponCode: couponCode.trim().toUpperCase(),
      couponName: couponName.trim(),
      description: '',
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minOrderAmount || 0),
      expiryDate: new Date(expiresAt).toISOString(),
      isActive: status === 'ACTIVE',
    };

    try {
      if (mode === 'create') {
        await couponService.createCoupon(payload);
        toast.success(`Coupon "${payload.couponCode}" created successfully`);
      } else if (mode === 'edit' && couponId) {
        await couponService.updateCoupon(couponId, payload);
        toast.success(`Coupon "${payload.couponCode}" updated successfully`);
      }
      navigate('/admin/coupons');
    } catch (err: any) {
      console.error('Error saving coupon:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save coupon.';
      toast.error(errMsg);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Filter coupons matching search terms
  const filteredCoupons = couponsList.filter(coupon => {
    const term = searchQuery.toLowerCase();
    return (
      coupon.couponCode.toLowerCase().includes(term) ||
      coupon.couponName.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left select-none">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            {mode !== 'list' && (
              <button
                onClick={() => navigate('/admin/coupons')}
                className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer active:scale-95 flex-shrink-0"
              >
                <ArrowLeft className="w-[18px] h-[18px]" />
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {mode === 'list' && 'Coupon Management'}
                {mode === 'create' && 'Create New Coupon'}
                {mode === 'edit' && `Edit Coupon: ${couponCode}`}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 font-bold mt-1.5 leading-snug">
                {mode === 'list' && 'Manage discount codes, campaign values, and customer validation thresholds.'}
                {mode === 'create' && 'Set up a new validation code, minimum order thresholds, and pricing discounts.'}
                {mode === 'edit' && 'Modify the parameters, values, requirements, or status flags of the coupon code.'}
              </p>
            </div>
          </div>

          {mode === 'list' && (
            <button
              onClick={() => navigate('/admin/coupons/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-[11.5px] font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer h-10.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>Create Coupon</span>
            </button>
          )}
        </div>

        {/* LIST VIEW PANEL */}
        {mode === 'list' && (
          <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden flex flex-col items-stretch">
            
            {/* SEARCH AND FILTERS BAR */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search coupons by code or campaign name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10.5 pr-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 bg-slate-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                onClick={fetchCoupons}
                disabled={isListingLoading}
                className="h-11 border border-slate-200 px-4 rounded-xl text-[11.5px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center justify-center space-x-2 active:scale-98 shadow-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${isListingLoading ? 'animate-spin' : ''}`} />
                <span>Refresh List</span>
              </button>
            </div>

            {/* MAIN TABLE */}
            <div className="overflow-x-auto">
              {isListingLoading ? (
                <div className="py-24 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">Retrieving coupons data, please wait...</p>
                </div>
              ) : filteredCoupons.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-sm mx-auto">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">No Coupons Found</h3>
                    <p className="text-[10px] text-slate-455 font-bold leading-relaxed">
                      {searchQuery ? 'No coupons matched your current search parameters.' : 'Your shop does not have any active discount coupons configured.'}
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold text-[9.5px]">
                      <th className="px-6 py-4 text-left font-black">Code</th>
                      <th className="px-6 py-4 text-left font-black">Campaign Details</th>
                      <th className="px-6 py-4 text-left font-black">Discount Value</th>
                      <th className="px-6 py-4 text-left font-black">Threshold Limits</th>
                      <th className="px-6 py-4 text-left font-black">Expiry Date</th>
                      <th className="px-6 py-4 text-left font-black">Status</th>
                      <th className="px-6 py-4 text-right font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 font-bold text-slate-655">
                    {filteredCoupons.map((coupon) => {
                      const id = coupon.couponId || coupon.coupon_id || coupon.id || '';
                      return (
                        <tr key={id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-black text-[10px] tracking-wider uppercase border border-blue-100">
                              {coupon.couponCode}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[12px] font-black text-slate-850 truncate max-w-[200px]">
                              {coupon.couponName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              {coupon.discountType === 'PERCENTAGE' ? (
                                <span className="text-[12px] font-black text-slate-800">{coupon.discountValue}% Off</span>
                              ) : (
                                <span className="text-[12px] font-black text-slate-800"><Price value={coupon.discountValue} /> Off</span>
                              )}
                              <span className="text-[9.5px] text-slate-400 uppercase font-extrabold tracking-wider mt-0.5">
                                {coupon.discountType} Discount
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-0.5">
                              {coupon.minimumOrderAmount ? (
                                <span className="text-slate-700">Min. Order: <Price value={coupon.minimumOrderAmount} /></span>
                              ) : (
                                <span className="text-slate-450">No Min. Amount</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">
                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <CouponStatusBadge status={coupon.isActive ? 'ACTIVE' : 'INACTIVE'} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => navigate(`/admin/coupons/${coupon.couponCode}`)}
                                className="h-8.5 px-3 border border-slate-200 rounded-lg hover:bg-white hover:text-blue-650 hover:border-slate-300 shadow-sm cursor-pointer active:scale-95 transition-all text-[11px]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(coupon.couponCode)}
                                className="h-8.5 w-8.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CREATE / EDIT FORM PANEL */}
        {mode !== 'list' && (
          <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-5 sm:p-6 lg:p-8">
            {isDetailLoading ? (
              <div className="py-24 text-center space-y-3 animate-pulse">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-bold">Loading Coupon Details...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveCoupon} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Coupon Code Input */}
                  <div className="flex flex-col space-y-1.5 text-left relative">
                    <label className="absolute left-4.5 -top-2 z-10 text-[9.5px] bg-white px-1.5 text-blue-655 font-bold uppercase tracking-wide">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME100"
                      className={`w-full border rounded-2xl h-14 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-all bg-white ${
                        formSubmitted && formErrors.couponCode ? 'border-red-450' : 'border-slate-200'
                      }`}
                    />
                    {formSubmitted && formErrors.couponCode && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 pl-4.5">{formErrors.couponCode}</p>
                    )}
                  </div>

                  {/* Coupon Name / Description Input */}
                  <div className="flex flex-col space-y-1.5 text-left relative">
                    <label className="absolute left-4.5 -top-2 z-10 text-[9.5px] bg-white px-1.5 text-blue-655 font-bold uppercase tracking-wide">
                      Coupon Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={couponName}
                      onChange={(e) => setCouponName(e.target.value)}
                      placeholder="Welcome First Purchase Discount"
                      className={`w-full border rounded-2xl h-14 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white ${
                        formSubmitted && formErrors.couponName ? 'border-red-455' : 'border-slate-200'
                      }`}
                    />
                    {formSubmitted && formErrors.couponName && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 pl-4.5">{formErrors.couponName}</p>
                    )}
                  </div>

                  {/* Discount Type Dropdown */}
                  <FormDiscountTypeDropdown
                    selected={discountType}
                    onSelect={(type) => setDiscountType(type)}
                  />

                  {/* Discount Value Input */}
                  <div className="flex flex-col space-y-1.5 text-left relative">
                    <label className="absolute left-4.5 -top-2 z-10 text-[9.5px] bg-white px-1.5 text-blue-655 font-bold uppercase tracking-wide">
                      {discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Fixed Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={discountType === 'PERCENTAGE' ? '15' : '100'}
                      min={1}
                      max={discountType === 'PERCENTAGE' ? 100 : undefined}
                      className={`w-full border rounded-2xl h-14 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white ${
                        formSubmitted && formErrors.discountValue ? 'border-red-455' : 'border-slate-200'
                      }`}
                    />
                    {formSubmitted && formErrors.discountValue && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 pl-4.5">{formErrors.discountValue}</p>
                    )}
                  </div>

                  {/* Minimum Order Amount Threshold Input */}
                  <div className="flex flex-col space-y-1.5 text-left relative">
                    <label className="absolute left-4.5 -top-2 z-10 text-[9.5px] bg-white px-1.5 text-blue-655 font-bold uppercase tracking-wide">
                      Minimum Order Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 500"
                      min={0}
                      className="w-full border rounded-2xl h-14 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white border-slate-200"
                    />
                  </div>



                  {/* Expiration Date Input */}
                  <div className="flex flex-col space-y-1.5 text-left relative">
                    <label className="absolute left-4.5 -top-2 z-10 text-[9.5px] bg-white px-1.5 text-blue-655 font-bold uppercase tracking-wide">
                      Expiration Date *
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className={`w-full border rounded-2xl h-14 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white ${
                        formSubmitted && formErrors.expiresAt ? 'border-red-455' : 'border-slate-200'
                      }`}
                    />
                    {formSubmitted && formErrors.expiresAt && (
                      <p className="text-[10px] font-bold text-red-500 mt-1 pl-4.5">{formErrors.expiresAt}</p>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <FormStatusDropdown
                    selected={status}
                    onSelect={(stat) => setStatus(stat)}
                  />

                </div>

                {/* FORM ACTIONS */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3.5">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/coupons')}
                    className="border border-slate-250 hover:bg-slate-50 px-5 h-12 rounded-xl text-xs font-bold text-slate-650 cursor-pointer active:scale-95 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isFormSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-7.5 h-12 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isFormSubmitting && <RefreshCw className="w-4 h-4 animate-spin text-white/80" />}
                    <span>{mode === 'create' ? 'Create Coupon' : 'Save Changes'}</span>
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
