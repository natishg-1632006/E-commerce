import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { InventoryTableSkeleton, DetailPageSkeleton, SafeImage } from '../../components/admin/AdminSkeletons';
import {
  AlertTriangle,
  Search,
  Grid,
  Boxes,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  ChevronDown,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import macbookImg from '../../assets/products/macbook.jpg';
import rogImg from '../../assets/products/rog.jpg';
import dellImg from '../../assets/products/dell.jpg';
import ssdImg from '../../assets/products/samsung_t7_ssd.jpg';
import sleeveImg from '../../assets/products/laptop_sleeve_leather.jpg';
import matImg from '../../assets/products/premium_desk_mat.jpg';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  threshold: number;
  reservedStock: number;
  soldQty: number;
  img: string;
}

const initialInventory: InventoryItem[] = [
  { id: 'P001', name: 'MacBook Pro M3 Max', sku: 'APL-MBP-M3-001', category: 'Laptops', currentStock: 150, threshold: 20, reservedStock: 30, soldQty: 580, img: macbookImg },
  { id: 'P002', name: 'ROG Zephyrus G16', sku: 'ASU-ROG-G16-002', category: 'Gaming', currentStock: 9, threshold: 5, reservedStock: 2, soldQty: 96, img: rogImg },
  { id: 'P003', name: 'Dell XPS 15 Plus', sku: 'DEL-XPS15-003', category: 'Laptops', currentStock: 0, threshold: 5, reservedStock: 0, soldQty: 84, img: dellImg },
  { id: 'P004', name: 'Samsung T7 Shield 2TB', sku: 'SAM-T7-2TB-004', category: 'Storage', currentStock: 60, threshold: 10, reservedStock: 6, soldQty: 254, img: ssdImg },
  { id: 'P005', name: 'Leather Laptop Sleeve 16"', sku: 'NAT-SLVE-005', category: 'Accessories', currentStock: 35, threshold: 10, reservedStock: 3, soldQty: 118, img: sleeveImg },
  { id: 'P006', name: 'Premium Desk Mat Pro', sku: 'NAT-MAT-006', category: 'Accessories', currentStock: 3, threshold: 10, reservedStock: 1, soldQty: 89, img: matImg },
];

const InventoryStatusBadge: React.FC<{ currentStock: number; threshold: number }> = ({ currentStock, threshold }) => {
  const baseClass = "inline-flex items-center justify-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 text-center";
  
  if (currentStock === 0) {
    return (
      <span className={`${baseClass} bg-red-50 text-red-500 border-red-100`}>
        <XCircle className="w-3 h-3 flex-shrink-0" />
        <span>Out of Stock</span>
      </span>
    );
  }
  if (currentStock <= threshold) {
    return (
      <span className={`${baseClass} bg-amber-50 text-amber-650 border-amber-100`}>
        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
        <span>Low Stock</span>
      </span>
    );
  }
  return (
    <span className={`${baseClass} bg-emerald-50 text-emerald-650 border-emerald-100`}>
      <CheckCircle className="w-3 h-3 flex-shrink-0" />
      <span>In Stock</span>
    </span>
  );
};

// --- Custom Reusable Dropdown Component ---
interface DropdownProps<T> {
  label: string;
  selected: T;
  options: { value: T; label: string }[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelect: (value: T) => void;
}

function PremiumDropdown<T>({ label, selected, options, isOpen, setIsOpen, onSelect }: DropdownProps<T>) {
  const activeLabel = options.find(o => o.value === selected)?.label || '';
  return (
    <div className="relative min-w-[168px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10.5 w-full px-4 rounded-xl border text-slate-700 text-[11.5px] font-bold transition-all flex items-center justify-between space-x-2.5 shadow-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none cursor-pointer ${
          isOpen
            ? 'bg-slate-50/80 border-blue-600 ring-4 ring-blue-600/10 shadow-sm shadow-blue-600/5'
            : 'bg-white hover:bg-slate-50/60 border-slate-200 hover:border-slate-350 shadow-sm shadow-slate-100/40'
        }`}
      >
        <span className="truncate">{label}: {activeLabel}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-48 flex flex-col animate-fadeIn"
          onMouseLeave={() => setIsOpen(false)}
        >
          {options.map(option => (
            <button
              key={String(option.value)}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-[11.5px] font-bold transition-colors hover:bg-slate-50 ${
                selected === option.value ? 'text-blue-600 bg-blue-50/10' : 'text-slate-650'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type SortField = 'name' | 'available' | 'current' | 'reserved' | 'sold';
type StatusFilterField = 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock';

const sortOptions = [
  { value: 'name' as SortField, label: 'Product Name' },
  { value: 'available' as SortField, label: 'Available Stock' },
  { value: 'current' as SortField, label: 'Current Stock' },
  { value: 'reserved' as SortField, label: 'Reserved Stock' },
  { value: 'sold' as SortField, label: 'Sold Quantity' },
];

const statusOptions = [
  { value: 'All' as StatusFilterField, label: 'All Status' },
  { value: 'In Stock' as StatusFilterField, label: 'In Stock' },
  { value: 'Low Stock' as StatusFilterField, label: 'Low Stock' },
  { value: 'Out of Stock' as StatusFilterField, label: 'Out of Stock' },
];

const AdminInventory: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(initialInventory);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterField>('All');
  const [sortBy, setSortBy] = useState<SortField>('name');
  
  // Custom dropdown open states
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Edit stock state (switches view to Full Inventory Details Page workspace when set)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [editingItem]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  };

  const handleStatusFilterChange = (val: StatusFilterField) => {
    setStatusFilter(val);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  };

  const handleSortChange = (val: SortField) => {
    setSortBy(val);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  };
  
  // Edit form state
  const [adjType, setAdjType] = useState<'increase' | 'decrease'>('increase');
  const [adjQty, setAdjQty] = useState<number>(25);
  const [editThreshold, setEditThreshold] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Loading state simulation
  const [isUpdating, setIsUpdating] = useState(false);

  // Nested Confirmation modal state
  const [pendingConfirm, setPendingConfirm] = useState<{
    item: InventoryItem;
    oldStock: number;
    operation: 'increase' | 'decrease';
    quantity: number;
    newStock: number;
    oldThreshold: number;
    newThreshold: number;
  } | null>(null);

  // Success message toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getStatus = (item: InventoryItem): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock <= item.threshold) return 'Low Stock';
    return 'In Stock';
  };

  // Filter logic
  const filtered = inventoryList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || getStatus(p) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'available') {
      const availA = a.currentStock - a.reservedStock;
      const availB = b.currentStock - b.reservedStock;
      return availB - availA;
    }
    if (sortBy === 'current') {
      return b.currentStock - a.currentStock;
    }
    if (sortBy === 'reserved') {
      return b.reservedStock - a.reservedStock;
    }
    if (sortBy === 'sold') {
      return b.soldQty - a.soldQty;
    }
    return 0;
  });

  const handleEditClick = (item: InventoryItem) => {
    setLoading(true);
    setEditingItem(item);
    setAdjType('increase');
    setAdjQty(25);
    setEditThreshold(item.threshold);
    setValidationError(null);
  };

  // Validate values live
  const calculateNewStock = (): number => {
    if (!editingItem) return 0;
    if (adjType === 'increase') {
      return editingItem.currentStock + adjQty;
    } else {
      return editingItem.currentStock - adjQty;
    }
  };

  const handleValidationCheck = (): boolean => {
    if (adjQty <= 0) {
      setValidationError('Adjustment quantity must be greater than zero.');
      return false;
    }
    if (editThreshold < 0) {
      setValidationError('Low stock threshold cannot be negative.');
      return false;
    }
    const newStock = calculateNewStock();
    if (newStock < 0) {
      setValidationError('❌ Cannot decrease more than current stock.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const triggerConfirmModal = () => {
    if (!editingItem) return;
    if (!handleValidationCheck()) return;

    setPendingConfirm({
      item: editingItem,
      oldStock: editingItem.currentStock,
      operation: adjType,
      quantity: adjQty,
      newStock: calculateNewStock(),
      oldThreshold: editingItem.threshold,
      newThreshold: editThreshold,
    });
  };

  const confirmSaveChanges = () => {
    if (!pendingConfirm || !editingItem) return;

    setIsUpdating(true);
    const { newStock, newThreshold } = pendingConfirm;

    // Simulate short network update delay
    setTimeout(() => {
      setInventoryList(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...item, currentStock: newStock, threshold: newThreshold }
            : item
        )
      );

      setIsUpdating(false);
      triggerToast(`Inventory updated successfully.`);
      setPendingConfirm(null);
      setEditingItem(null); // Return to list view
    }, 800);
  };

  const outOfStockCount = inventoryList.filter(p => p.currentStock === 0).length;
  const lowStockCount = inventoryList.filter(p => p.currentStock > 0 && p.currentStock <= p.threshold).length;
  const totalUnits = inventoryList.reduce((s, p) => s + p.currentStock, 0);

  // Compute validation state for UI updates
  const isFormValid = adjQty > 0 && editThreshold >= 0 && (editingItem ? (adjType === 'increase' ? true : (editingItem.currentStock - adjQty >= 0)) : false);

  // Exact Grid Percentages:
  // Product -> 24%, Available -> 11%, Current -> 11%, Threshold -> 14%, Reserved -> 10%, Sold -> 10%, Status -> 10%, Auto space -> 10%
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '24% 11% 11% 14% 10% 10% 10% auto',
  };

  return (
    <AdminLayout>
      <div className="p-5 sm:p-7 space-y-6 relative animate-fadeIn">
        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white text-[12px] font-bold px-4 py-3 rounded-xl shadow-lg border border-slate-800 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {!editingItem ? (
          /* ================= LIST VIEW ================= */
          <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-[12px] font-bold text-blue-600 tracking-wider uppercase">Warehouse Hub</div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Inventory</h1>
                <p className="text-[12.5px] text-slate-555 font-medium mt-0.5">
                  Stock levels, adjustments pipeline, and warehouse warnings
                </p>
              </div>
            </div>

            {/* Alarm Notice */}
            {(outOfStockCount > 0 || lowStockCount > 0) && (
              <div className="flex items-center space-x-3 bg-red-50 border border-red-200/40 rounded-2xl px-5 py-3.5 shadow-sm">
                <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 animate-bounce" />
                <span className="text-[12.5px] font-bold text-red-655">
                  Alert: {outOfStockCount} items out of stock and {lowStockCount} items running below threshold. Action required.
                </span>
              </div>
            )}

            {/* Quick statistics highlights block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 rounded-[16px] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Units in Stock</span>
                  <div className="text-2xl font-black text-slate-800 mt-0.5 leading-none">{totalUnits.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Boxes className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-[16px] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
                  <div className="text-2xl font-black text-slate-800 mt-0.5 leading-none">{lowStockCount} Items</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-[16px] p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Out of Stock Items</span>
                  <div className="text-2xl font-black text-slate-800 mt-0.5 leading-none">{outOfStockCount} Items</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>

            {/* Search, Custom Status Filters & Premium Custom Sort selector row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    placeholder="Search by name or category..."
                    className="w-full h-10.5 pl-9 pr-4 bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-slate-350 focus:bg-slate-50/80 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none rounded-xl text-[12px] text-slate-700 placeholder-slate-400 font-medium transition-all duration-200"
                  />
                </div>
                
                {/* Premium Reusable Status Dropdown Filter */}
                <PremiumDropdown<StatusFilterField>
                  label="Status"
                  selected={statusFilter}
                  options={statusOptions}
                  isOpen={isStatusOpen}
                  setIsOpen={setIsStatusOpen}
                  onSelect={handleStatusFilterChange}
                />
              </div>

              {/* Premium Custom Sort dropdown selector */}
              <PremiumDropdown<SortField>
                label="Sort By"
                selected={sortBy}
                options={sortOptions}
                isOpen={isSortOpen}
                setIsOpen={setIsSortOpen}
                onSelect={handleSortChange}
              />
            </div>

            {loading ? (
              <InventoryTableSkeleton />
            ) : (
              /* Inventory Panel List */
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col pt-1 w-full overflow-hidden relative">
                <style>{`
                  @keyframes loadingBar {
                    0% { left: -35%; }
                    100% { left: 100%; }
                  }
                  .animate-loadingBar {
                    animation: loadingBar 1s linear infinite;
                  }
                `}</style>
                
                {isRefreshing && (
                  <div className="w-full h-0.5 bg-blue-100 relative overflow-hidden z-10">
                    <div className="absolute top-0 left-0 h-full bg-blue-600 animate-loadingBar w-1/3 rounded-full" />
                  </div>
                )}

                <div className={`w-full flex flex-col transition-opacity duration-205 ${isRefreshing ? 'opacity-55 pointer-events-none' : ''}`}>
                  {/* Header Row */}
                  <div
                    style={gridStyle}
                    className="hidden sm:grid gap-2 items-center border-b border-slate-100 px-4 py-3 bg-slate-50/20 text-[10px] font-black text-slate-400 uppercase tracking-wider"
                  >
                    <div>Product</div>
                    <div className="text-right">Available</div>
                    <div className="text-right">Current</div>
                    <div className="text-right">Threshold</div>
                    <div className="text-right">Reserved</div>
                    <div className="text-right">Sold</div>
                    <div className="text-center">Status</div>
                    <div></div>
                  </div>                  {/* List Rows */}
                  <div className="relative p-2 sm:p-3 bg-white min-h-[250px]">
                    {isRefreshing && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 p-2 sm:p-3 space-y-2 sm:space-y-2.5 pointer-events-none">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                          <div
                            key={idx}
                            style={gridStyle}
                            className="flex flex-col sm:grid gap-2 sm:gap-3 items-start sm:items-center p-3.5 sm:p-2.5 rounded-xl border border-slate-50 bg-white"
                          >
                            {/* 1. Product */}
                            <div className="flex items-center space-x-2.5 w-full sm:w-auto min-w-0">
                              <div className="w-11 h-11 rounded-lg bg-slate-200 animate-pulse flex-shrink-0" />
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="h-3.5 bg-slate-200 animate-pulse rounded w-4/5" />
                                <div className="h-2.5 bg-slate-200 animate-pulse rounded w-1/3" />
                              </div>
                            </div>
                            {/* 2. Available */}
                            <div className="flex justify-end w-full sm:w-auto"><div className="h-4 bg-slate-200 animate-pulse rounded w-12" /></div>
                            {/* 3. Current */}
                            <div className="flex justify-end w-full sm:w-auto"><div className="h-4 bg-slate-200 animate-pulse rounded w-12" /></div>
                            {/* 4. Threshold */}
                            <div className="flex justify-end w-full sm:w-auto"><div className="h-4 bg-slate-200 animate-pulse rounded w-12" /></div>
                            {/* 5. Reserved */}
                            <div className="flex justify-end w-full sm:w-auto"><div className="h-4 bg-slate-200 animate-pulse rounded w-12" /></div>
                            {/* 6. Sold */}
                            <div className="flex justify-end w-full sm:w-auto"><div className="h-4 bg-slate-200 animate-pulse rounded w-12" /></div>
                            {/* 7. Status */}
                            <div className="flex justify-center w-full sm:w-auto"><div className="h-7 bg-slate-200 animate-pulse rounded-full w-20" /></div>
                            {/* 8. Blank auto track */}
                            <div></div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`space-y-2 sm:space-y-2.5 transition-opacity duration-205 ${isRefreshing ? 'opacity-30 pointer-events-none' : ''}`}>
                      {sorted.map((p) => {
                        const availableStock = p.currentStock - p.reservedStock;
                        const isBelowThreshold = p.currentStock <= p.threshold;

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleEditClick(p)}
                            className="flex flex-col sm:grid gap-2 sm:gap-3 items-start sm:items-center p-3.5 sm:p-2.5 rounded-xl border border-slate-100 cursor-pointer transition-all duration-200 hover:border-blue-150 hover:bg-slate-50/40 hover:shadow-sm bg-white"
                            style={gridStyle}
                          >
                            {/* 1. Product Details (image resized to 44x44, title truncated to 1 line) */}
                            <div className="flex items-center space-x-2.5 w-full sm:w-auto min-w-0">
                              <SafeImage src={p.img} alt={p.name} className="w-11 h-11 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="text-[12px] font-bold text-slate-855 truncate whitespace-nowrap leading-tight" title={p.name}>
                                  {p.name}
                                </div>
                                <div className="text-[9.5px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1 leading-none">
                                  <Grid className="w-3 h-3 text-slate-355 flex-shrink-0" />
                                  <span>{p.category}</span>
                                </div>
                              </div>
                            </div>

                            {/* 2. Available stock status */}
                            <div className="flex sm:justify-end items-center text-[12.5px] font-extrabold text-slate-800">
                              <span className="sm:hidden text-slate-400 text-[10px] mr-1.5">Available:</span>
                              <div className="flex items-center space-x-1">
                                <CheckCircle className={`w-3.5 h-3.5 ${availableStock <= 0 ? 'text-red-400' : 'text-slate-400'} flex-shrink-0`} />
                                <span>{availableStock} Units</span>
                              </div>
                            </div>

                            {/* 3. Current stock */}
                            <div className="flex sm:justify-end items-center text-[12px] font-bold text-slate-800">
                              <span className="sm:hidden text-slate-400 text-[10px] mr-1.5">Current:</span>
                              <div className="flex items-center space-x-1">
                                <Boxes className={`w-3.5 h-3.5 ${isBelowThreshold ? 'text-red-400' : 'text-slate-450'} flex-shrink-0`} />
                                <span>{p.currentStock} Units</span>
                              </div>
                            </div>

                            {/* 4. Alert low threshold stock value badge */}
                            <div className="flex sm:justify-end items-center text-[11.5px] font-semibold text-slate-500">
                              <span className="sm:hidden text-slate-400 text-[10px] mr-1.5">Threshold:</span>
                              <div className="flex items-center space-x-1">
                                <AlertTriangle className={`w-3.5 h-3.5 ${isBelowThreshold ? 'text-red-500 animate-bounce mt-0.5' : 'text-slate-350'} flex-shrink-0`} />
                                <span className={isBelowThreshold ? 'text-red-650 font-black' : ''}>{p.threshold} Limit</span>
                              </div>
                            </div>

                            {/* 5. Reserved stock */}
                            <div className="flex sm:justify-end items-center text-[11.5px] font-semibold text-slate-500">
                              <span className="sm:hidden text-slate-400 text-[10px] mr-1.5">Reserved:</span>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-slate-350 flex-shrink-0" />
                                <span>{p.reservedStock} Units</span>
                              </div>
                            </div>

                            {/* 6. Sold stock */}
                            <div className="flex sm:justify-end items-center text-[11.5px] font-semibold text-slate-500">
                              <span className="sm:hidden text-slate-400 text-[10px]">Sold:</span>
                              <div className="flex items-center space-x-1">
                                <ShoppingBag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span>{p.soldQty} Units</span>
                              </div>
                            </div>

                            {/* 7. Status badge */}
                            <div className="flex items-center justify-start sm:justify-center w-full sm:w-auto">
                              <InventoryStatusBadge currentStock={p.currentStock} threshold={p.threshold} />
                            </div>

                            {/* 8. Blank auto track */}
                            <div></div>
                          </div>
                        );
                      })}

                      {sorted.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                          <Boxes className="w-12 h-12 text-slate-200" />
                          <div>
                            <div className="text-[13.5px] font-black text-slate-900">No inventory records found.</div>
                            <div className="text-[11.5px] text-slate-400 mt-0.5">Filter search criteria returned empty results.</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>  </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= WORKSPACE VIEW: FULL INVENTORY DETAILS PAGE ================= */
          <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header & Sticky Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-slate-100 gap-4">
              <div className="space-y-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex items-center space-x-2 text-[12px] font-bold text-blue-600 hover:text-blue-750 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to Inventory List</span>
                </button>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center space-x-3">
                    <SafeImage src={editingItem.img} alt={editingItem.name} className="w-10 h-10 rounded-xl border border-slate-200" />
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{editingItem.name}</h1>
                  </div>
                  <InventoryStatusBadge currentStock={editingItem.currentStock} threshold={editingItem.threshold} />
                </div>
                
                <div className="flex items-center space-x-4 text-[11px] text-slate-455 font-bold mt-1">
                  <span>Product ID: {editingItem.id}</span>
                  <span className="text-slate-200">•</span>
                  <span>SKU: {editingItem.sku}</span>
                  <span className="text-slate-200">•</span>
                  <span>Category: {editingItem.category}</span>
                </div>
              </div>

              {/* Action Controls Top Right */}
              <div className="flex items-center space-x-3 self-start md:self-auto">
                <button
                  onClick={() => setEditingItem(null)}
                  className="h-9 px-4 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-655 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerConfirmModal}
                  disabled={!isFormValid}
                  className={`h-9 px-5 rounded-xl text-[12px] font-bold transition-all shadow-md active:scale-95 flex items-center space-x-1.5 cursor-pointer ${
                    isFormValid
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed'
                  }`}
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Update Inventory</span>
                </button>
              </div>
            </div>

            {loading ? (
              <DetailPageSkeleton columns={2} />
            ) : (
              <>
                {/* Validation warning block */}
                {validationError && (
                  <div className="p-3.5 bg-red-50 border border-red-200/50 rounded-2xl flex items-center space-x-2 text-red-655 text-[12px] font-bold animate-pulse">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

            {/* Quick Summary Cards (Matching Order Details Summary style) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-100 rounded-[16px] p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Stock</span>
                <div className="text-xl font-black text-slate-800 mt-1 leading-none">{editingItem.currentStock} Units</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-[16px] p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</span>
                <div className="text-xl font-black text-blue-600 mt-1 leading-none">{(editingItem.currentStock - editingItem.reservedStock)} Units</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-[16px] p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reserved Stock</span>
                <div className="text-xl font-black text-slate-700 mt-1 leading-none">{editingItem.reservedStock} Units</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-[16px] p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sold Quantity</span>
                <div className="text-xl font-black text-slate-800 mt-1 leading-none">{editingItem.soldQty} Units</div>
              </div>
            </div>

            {/* Main Configuration Details Content Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Content column: Stock adjustment adjustments panels (lg:col-span-8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Stock Adjustment card */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-[14px] font-black text-slate-900">Stock Adjustment</h3>
                    <p className="text-[11.5px] text-slate-400 font-semibold mt-0.5">
                      Choose adjustment operation and input target values to modify active inventory stock levels safely.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Adjustment Segmented choices */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Adjustment Type</span>
                      <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/40">
                        <button
                          onClick={() => {
                            setAdjType('increase');
                            setValidationError(null);
                          }}
                          className={`flex-1 py-2 rounded-lg text-[10.5px] font-black flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                            adjType === 'increase'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <span>+ Increase Stock</span>
                        </button>
                        <button
                          onClick={() => {
                            setAdjType('decrease');
                            setValidationError(null);
                          }}
                          className={`flex-1 py-2 rounded-lg text-[10.5px] font-black flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                            adjType === 'decrease'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <span>− Decrease Stock</span>
                        </button>
                      </div>
                    </div>

                    {/* Quantity field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Adjustment Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={adjQty}
                        placeholder="Enter quantity"
                        onChange={e => {
                          setAdjQty(parseInt(e.target.value) || 0);
                          setValidationError(null);
                        }}
                        className="w-full h-10 px-3 bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-slate-350 focus:bg-slate-50/80 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none rounded-xl text-[12.5px] font-bold text-slate-700 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Live Preview Card */}
                  <div className="p-4 bg-blue-50/20 border border-blue-100 rounded-xl space-y-2.5">
                    <span className="text-[9.5px] font-black text-blue-600 uppercase tracking-wider block">Live Preview Card</span>
                    <div className="grid grid-cols-3 gap-3 text-center text-[11.5px] font-bold text-slate-655 font-semibold">
                      <div>
                        <span className="text-slate-400 block text-[9.5px] uppercase">Current Stock</span>
                        <span className="text-slate-800 text-[13px] mt-0.5 block">{editingItem.currentStock} Units</span>
                      </div>
                      <div>
                        <span className="text-slate-455 block text-[9.5px] uppercase">Adjustment</span>
                        <span className={`text-[13px] font-black ${adjType === 'increase' ? 'text-emerald-500' : 'text-amber-500'} mt-0.5 block`}>
                          {adjType === 'increase' ? '+' : '−'}{adjQty}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-600 block text-[9.5px] uppercase">New Stock</span>
                        <span className="text-blue-600 font-black text-[14px] mt-0.5 block">{calculateNewStock()} Units</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Low Stock Settings Card */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-[14px] font-black text-slate-900">Inventory Settings</h3>
                    <p className="text-[11.5px] text-slate-400 font-semibold mt-0.5">
                      Configure stock alert levels. Warning alerts trigger automatically inside the catalog and admin dashboard reports.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Low Stock Threshold</label>
                    <input
                      type="number"
                      min={0}
                      value={editThreshold}
                      onChange={e => {
                        setEditThreshold(parseInt(e.target.value) || 0);
                        setValidationError(null);
                      }}
                      className="w-full h-10 px-3 bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-slate-350 focus:bg-slate-50/80 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none rounded-xl text-[12.5px] font-bold text-slate-700 transition-all duration-200"
                    />
                    <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                      The product will be marked as Low Stock when available stock falls below this value.
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column details: Real-Time Summary & Save confirmation logs (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Inventory Summary block */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-[14px] font-black text-slate-900">Inventory Summary</h3>
                  <div className="border-t border-slate-50 pt-2.5 space-y-3.5 text-[11.5px] text-slate-650 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Stock</span>
                      <span className="text-slate-800 font-bold">{editingItem.currentStock} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Operation</span>
                      <span className="text-slate-850 font-bold capitalize">{adjType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Adjustment</span>
                      <span className={`font-bold ${adjType === 'increase' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {adjType === 'increase' ? '+' : '−'}{adjQty} Units
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-[12px]">
                      <span className="text-slate-900 font-bold">New Stock</span>
                      <span className="text-blue-600 font-black">{calculateNewStock()} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Threshold Trigger</span>
                      <span className="text-slate-800 font-bold">{editThreshold} Units</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    )}

        {/* Nested Confirmation Dialog modal */}
        {pendingConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4">
              <div className="flex items-center space-x-2.5 text-amber-500">
                <AlertTriangle className="w-5.5 h-5.5 animate-pulse" />
                <h3 className="text-[14px] font-black text-slate-900 leading-tight">Update Inventory?</h3>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-[11.5px] text-slate-655 font-semibold">
                <div>
                  <span className="text-slate-400">Product:</span>{' '}
                  <span className="font-extrabold text-slate-800">{pendingConfirm.item.name}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/55 pt-1.5">
                  <span className="text-slate-400">Operation:</span>
                  <span className="text-slate-800 font-bold capitalize">{pendingConfirm.operation} Stock</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity:</span>
                  <span className="text-slate-850 font-extrabold">{pendingConfirm.quantity} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Stock:</span>
                  <span className="text-slate-800 font-bold">{pendingConfirm.oldStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">New Stock:</span>
                  <span className="text-blue-650 font-black">{pendingConfirm.newStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Low Stock Threshold:</span>
                  <span className="text-slate-855 font-extrabold">{pendingConfirm.newThreshold}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 justify-end pt-1">
                <button
                  onClick={() => setPendingConfirm(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-[12px] font-bold text-slate-655 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSaveChanges}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-xl transition-all shadow-md shadow-blue-600/25 active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Update</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
