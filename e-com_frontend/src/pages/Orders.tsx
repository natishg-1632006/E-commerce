import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MainLayout } from '../layouts/MainLayout';
import { Price } from '../components/ui/Price';
import { addToCart } from '../store/cartSlice';
import toast from 'react-hot-toast';
import {
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Truck,
  Download,
  RefreshCw,
  MapPin,
  CreditCard,
  SlidersHorizontal,
  Calendar,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';

import rogImg from '../assets/products/rog.jpg';
import dellImg from '../assets/products/dell.jpg';
import ssdImg from '../assets/products/samsung_t7_ssd.jpg';
import sleeveImg from '../assets/products/laptop_sleeve_leather.jpg';
import matImg from '../assets/products/premium_desk_mat.jpg';
import guideImg from '../assets/products/guide.jpg';

export const Orders: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // State Management
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Orders');
  const [expandedMobileOrders, setExpandedMobileOrders] = useState<Record<string, boolean>>({});

  // Trigger simulated loading skeleton state on tab filter/mount transitions
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery]);

  // Mock Active Orders Data
  const ordersData = [
    {
      id: 'NC-882190',
      placedDate: 'Oct 24, 2024',
      deliveredDate: null,
      status: 'In Transit',
      quantity: 1,
      price: 119900,
      name: 'NatCart AirPhone 15 Pro Max',
      specs: 'Titanium Gray • 256GB',
      image: dellImg, // Phone equivalent
      trackingSteps: [
        { label: 'Confirmed', date: 'Oct 24, 2024, 10:00 AM', active: true },
        { label: 'Packed', date: 'Oct 24, 2024, 2:30 PM', active: true },
        { label: 'Shipped', date: 'Oct 25, 2024, 9:15 AM', active: true },
        { label: 'Out for Delivery', date: 'Expected Oct 27', active: false },
        { label: 'Delivered', date: 'Expected Oct 28', active: false }
      ],
      shippingAddress: {
        name: 'Alex Mercer',
        address: '1200 Innovation Way, Suite 400',
        cityStateZip: 'Palo Alto, CA 94304'
      },
      paymentSummary: {
        subtotal: 119900,
        shipping: 0,
        total: 119900
      }
    },
    {
      id: 'NC-772154',
      placedDate: 'Oct 14, 2024',
      deliveredDate: 'Oct 18, 2024',
      status: 'Delivered',
      quantity: 1,
      price: 34900,
      name: 'NatSound Elite Studio H1',
      specs: 'Matte Black • ANC Edition',
      image: rogImg, // Headphones equivalent
      trackingSteps: [
        { label: 'Confirmed', date: 'Oct 14, 2024, 8:00 AM', active: true },
        { label: 'Packed', date: 'Oct 14, 2024, 11:30 AM', active: true },
        { label: 'Shipped', date: 'Oct 15, 2024, 4:00 PM', active: true },
        { label: 'Out for Delivery', date: 'Oct 18, 2024, 9:00 AM', active: true },
        { label: 'Delivered', date: 'Oct 18, 2024, 3:30 PM', active: true }
      ],
      shippingAddress: {
        name: 'Alex Mercer',
        address: '1200 Innovation Way, Suite 400',
        cityStateZip: 'Palo Alto, CA 94304'
      },
      paymentSummary: {
        subtotal: 34900,
        shipping: 0,
        total: 34900
      }
    }
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto flex flex-col items-stretch space-y-8 select-none text-left animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2 text-[10.5px] font-bold text-slate-455">
            <div className="h-3.5 w-10 bg-slate-200 rounded" />
            <div className="h-3.5 w-3 bg-slate-300/50" />
            <div className="h-3.5 w-16 bg-slate-200 rounded" />
            <div className="h-3.5 w-3 bg-slate-300/50" />
            <div className="h-3.5 w-16 bg-slate-200 rounded" />
          </div>

          {/* Header Title */}
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-7 w-40 bg-slate-300 rounded" />
              <div className="h-3.5 w-60 bg-slate-200 rounded" />
            </div>
            <div className="flex space-x-2">
              <div className="h-9 w-20 bg-slate-100 rounded-xl" />
              <div className="h-9 w-20 bg-slate-100 rounded-xl" />
            </div>
          </div>

          {/* Tabs & Search controls */}
          <div className="space-y-4">
            <div className="flex space-x-2 pb-2">
              <div className="h-8 w-24 bg-slate-200 rounded-full" />
              <div className="h-8 w-24 bg-slate-105 rounded-full" />
              <div className="h-8 w-24 bg-slate-105 rounded-full" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="h-10 flex-grow bg-slate-105 rounded-xl" />
              <div className="h-10 w-24 bg-slate-105 rounded-xl" />
            </div>
          </div>

          {/* Skeletons list */}
          <div className="space-y-5">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-200/50 rounded-3xl p-6 space-y-5 shadow-sm shimmer-sweep">
                {/* Header card metadata */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex space-x-4">
                    <div className="h-4.5 w-24 bg-slate-300 rounded" />
                    <div className="h-4.5 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="h-5 w-24 bg-slate-300 rounded-full" />
                </div>
                {/* Details layout */}
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl flex-shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-4.5 w-48 bg-slate-300 rounded" />
                    <div className="h-3 w-32 bg-slate-200 rounded" />
                  </div>
                  <div className="h-5 w-20 bg-slate-300 rounded" />
                </div>
                {/* Timeline visual */}
                <div className="h-12 w-full bg-slate-100 rounded-2xl" />
                {/* Actions footer */}
                <div className="flex justify-end space-x-3.5 pt-4 border-t border-slate-100">
                  <div className="h-9 w-28 bg-slate-200 rounded-lg" />
                  <div className="h-9 w-28 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  // Accessories Slider Data
  const accessories = [
    { id: 'acc-sleeve', name: 'ProLeather Shield 14"', price: 8900, listPrice: 11900, image: sleeveImg, specs: 'Premium Leather' },
    { id: 'acc-dock', name: 'CoreLink Multi-Dock', price: 14900, listPrice: 17900, image: ssdImg, specs: '10-in-1 Hub' },
    { id: 'acc-mat', name: 'TypeFlow Mechanical Air', price: 19900, listPrice: 24900, image: matImg, specs: 'Wireless Mechanical' },
    { id: 'acc-kit', name: 'NanoClear Display Kit', price: 2900, listPrice: 3900, image: guideImg, specs: 'Microfiber & Spray' }
  ];

  // Tab configurations
  const tabs = ['All Orders', 'In Transit', 'Delivered'];

  // Toggle package details expansion on mobile
  const toggleMobileOrderExpansion = (orderId: string) => {
    setExpandedMobileOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Add accessory to Redux cart
  const handleAddAccessoryToCart = (acc: typeof accessories[0]) => {
    dispatch(
      addToCart({
        id: acc.id,
        name: acc.name,
        brand: 'ACCESSORY',
        price: acc.price,
        image: acc.image,
        ram: 'Standard',
        storage: 'Standard'
      })
    );
  };

  // Filter logic
  const filteredOrders = ordersData.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'All Orders') return matchesSearch;
    return matchesSearch && order.status === activeTab;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-1 sm:px-4 space-y-6">
        
        {/* Breadcrumb Path */}
        <nav className="text-[11px] font-black text-slate-450 uppercase tracking-widest flex items-center space-x-1.5 justify-start select-none">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Account</span>
          <span>&gt;</span>
          <span className="text-slate-900">My Orders</span>
        </nav>

        {/* Demo Switch Controller */}
        <div className="flex items-center justify-between bg-slate-100 border border-slate-200/80 p-3 rounded-2xl select-none">
          <div className="flex flex-col text-left space-y-0.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Dashboard View Mode</span>
            <span className="text-xs font-bold text-slate-700">Toggle between empty and loaded orders dashboard layouts</span>
          </div>
          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-600 hover:bg-blue-700 text-white shadow transition-all cursor-pointer active:scale-95"
          >
            {showEmptyState ? 'Show Loaded State' : 'Show Empty State'}
          </button>
        </div>

        {!showEmptyState ? (
          /* Active Loaded State Layout */
          <>
            {/* Desktop-only Header Dashboard Row */}
            <div className="hidden sm:flex items-center justify-between text-left">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Orders</h1>
                <p className="text-xs text-slate-500 font-semibold">View, track, manage, and review all your purchases.</p>
              </div>

              {/* Status Stats Widgets */}
              <div className="flex items-center space-x-3.5">
                <div className="bg-white border border-slate-200/60 rounded-2xl px-5 py-2.5 flex flex-col items-start min-w-[80px] shadow-sm select-none">
                  <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider">Total</span>
                  <span className="text-base font-black text-blue-600 mt-0.5">24</span>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-2xl px-5 py-2.5 flex flex-col items-start min-w-[80px] shadow-sm select-none">
                  <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider">Delivered</span>
                  <span className="text-base font-black text-green-650 mt-0.5">21</span>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-2xl px-5 py-2.5 flex flex-col items-start min-w-[80px] shadow-sm select-none">
                  <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider">Pending</span>
                  <span className="text-base font-black text-blue-600 mt-0.5">3</span>
                </div>
              </div>
            </div>

            {/* Filters Navigation and Search Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
              {/* Horizontal Tabs selector */}
              <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-black tracking-wide cursor-pointer transition-all border shrink-0",
                      activeTab === tab
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Right filters inputs */}
              <div className="flex items-center space-x-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Order ID or Product Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-semibold text-slate-700 focus:border-blue-600 outline-none transition-colors bg-white shadow-sm"
                  />
                </div>

                {/* Status Options & Date Filters */}
                <button className="h-10 border border-slate-200 bg-white rounded-xl px-4 flex items-center space-x-2 text-xs font-black text-slate-750 hover:bg-slate-50 cursor-pointer shadow-sm">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Status</span>
                </button>

                <button className="h-10 border border-slate-200 bg-white rounded-xl px-4 flex items-center space-x-2 text-xs font-black text-slate-750 hover:bg-slate-50 cursor-pointer shadow-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Last 3 Months</span>
                </button>
              </div>
            </div>

            {/* Orders Listing Grid */}
            <div className="space-y-5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    
                    {/* Desktop Card Layout */}
                    <div className="hidden sm:flex bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex-col space-y-6 text-left">
                      
                      {/* Order Details Header */}
                      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-center justify-center p-2.5 flex-shrink-0">
                            <img src={order.image} alt={order.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 tracking-tight">{order.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold mt-1 flex items-center space-x-3">
                              <span>Order ID: <b className="text-blue-650">#{order.id}</b></span>
                              <span>•</span>
                              <span>{order.placedDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status tag & tracking buttons */}
                        <div className="flex items-center space-x-3">
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase flex items-center space-x-1.5",
                              order.status === 'Delivered'
                                ? "bg-green-50 text-green-755 border border-green-100/60"
                                : "bg-blue-50 text-blue-755 border border-blue-100/60"
                            )}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{order.status}</span>
                          </span>
                          <span className="text-[10px] font-black text-slate-455">Qty: {order.quantity}</span>
                          <span className="text-xs font-black text-slate-950 ml-2">
                            <Price value={order.price} />
                          </span>
                        </div>
                      </div>

                      {/* Content block: Tracking steps timeline, shipping details, total summary */}
                      <div className="grid grid-cols-12 gap-8">
                        {/* Left Side: Live Tracking Line Progress */}
                        <div className="col-span-7 flex flex-col justify-center space-y-4">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tracking Status</span>
                          
                          {/* Progress Nodes Row */}
                          <div className="flex items-center justify-between relative mt-2 px-1 select-none">
                            {/* Horizontal joining connector bar background */}
                            <div className="absolute top-[13px] left-3 right-3 h-[2.5px] bg-slate-100 z-0" />
                            
                            {/* Horizontal active colored connector path */}
                            <div
                              className="absolute top-[13px] left-3 h-[2.5px] bg-blue-600 transition-all duration-500 z-0"
                              style={{
                                width: `${
                                  order.status === 'Delivered'
                                    ? '100%'
                                    : '50%'
                                }`
                              }}
                            />

                            {/* Tracking nodes mapping */}
                            {order.trackingSteps.map((step, idx) => (
                              <div key={idx} className="flex flex-col items-center space-y-2 relative z-10">
                                {/* Circular Node */}
                                <div
                                  className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    step.active
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-slate-200 bg-white text-slate-300"
                                  )}
                                >
                                  {step.active ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                  )}
                                </div>
                                {/* Meta details label */}
                                <div className="text-center">
                                  <div className="text-[10px] font-black text-slate-800 tracking-tight leading-none">{step.label}</div>
                                  <div className="text-[8px] text-slate-400 font-semibold mt-1 whitespace-nowrap">{step.date}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Middle: Shipping Details & Payment Invoice summary */}
                        <div className="col-span-5 border-l border-slate-100 pl-8 grid grid-cols-2 gap-6">
                          
                          {/* Shipping address details */}
                          <div className="space-y-2 text-left">
                            <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>Shipping Address</span>
                            </div>
                            <div className="text-[11px] space-y-0.5">
                              <div className="font-extrabold text-slate-800">{order.shippingAddress.name}</div>
                              <div className="text-slate-500 font-semibold">{order.shippingAddress.address}</div>
                              <div className="text-slate-500 font-semibold">{order.shippingAddress.cityStateZip}</div>
                            </div>
                          </div>

                          {/* Payment price aggregate summaries */}
                          <div className="space-y-2 text-left">
                            <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-455 uppercase tracking-wider">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              <span>Payment Summary</span>
                            </div>
                            <div className="text-[10.5px] space-y-1.5 font-bold">
                              <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <Price value={order.paymentSummary.subtotal} />
                              </div>
                              <div className="flex justify-between text-slate-500">
                                <span>Shipping</span>
                                <span className="text-green-600">Free</span>
                              </div>
                              <div className="flex justify-between text-slate-850 font-black border-t border-slate-100 pt-1.5">
                                <span>Total</span>
                                <Price value={order.paymentSummary.total} />
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Card Footer Options */}
                      <div className="border-t border-slate-100 pt-4 flex items-center justify-between select-none">
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-1.5 text-[10px] font-black text-slate-450 hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none">
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Invoice</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-3">
                          {order.status === 'Delivered' ? (
                            <>
                              <button className="h-9 px-5 rounded-full border border-slate-200 text-[10px] font-black text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95">
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  dispatch(
                                    addToCart({
                                      id: order.id,
                                      name: order.name,
                                      brand: 'REORDER',
                                      price: order.price,
                                      image: order.image,
                                      ram: 'Standard',
                                      storage: 'Standard'
                                    })
                                  );
                                  toast.success(`${order.name} added to cart!`, { icon: '🛒' });
                                }}
                                className="h-9 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 shadow transition-colors cursor-pointer active:scale-95"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Buy Again</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="h-9 px-5 rounded-full border border-slate-200 text-[10px] font-black text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95">
                                Details
                              </button>
                              <button className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow transition-colors cursor-pointer active:scale-95">
                                Track Live
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Mobile Card Layout (Screenshot 1 replica) */}
                    <div className="block sm:hidden bg-white border border-slate-200/60 rounded-3xl p-4.5 shadow-sm space-y-4 text-left">
                      
                      {/* Card Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-slate-800">Order #{order.id}</div>
                          <div className="text-[10px] text-slate-450 font-bold">Placed on {order.placedDate}</div>
                        </div>

                        {/* Status badge */}
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-black flex items-center space-x-1",
                            order.status === 'Delivered'
                              ? "bg-green-50 text-green-700"
                              : "bg-blue-50 text-blue-700"
                          )}
                        >
                          <Truck className="w-3 h-3 flex-shrink-0" />
                          <span>{order.status}</span>
                        </span>
                      </div>

                      {/* Product capsule representation */}
                      <div className="bg-slate-50/50 border border-slate-100/60 rounded-2xl p-3 flex items-center space-x-3.5">
                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 flex-shrink-0">
                          <img src={order.image} alt={order.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-slate-850 truncate">{order.name}</div>
                          <div className="text-[10px] text-slate-455 font-bold mt-0.5 truncate">{order.specs}</div>
                          <Price value={order.price} className="text-xs font-black text-slate-900 mt-1.5 block" />
                        </div>
                      </div>

                      {/* Expandable Package Tracker */}
                      <div className="border-t border-b border-slate-100/80 py-2.5">
                        <button
                          onClick={() => toggleMobileOrderExpansion(order.id)}
                          className="w-full flex items-center justify-between text-xs font-black text-blue-600 hover:text-blue-800 focus:outline-none bg-transparent border-none cursor-pointer"
                        >
                          <span>Track Package</span>
                          {expandedMobileOrders[order.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {expandedMobileOrders[order.id] && (
                          <div className="mt-4 pl-3 space-y-6 relative">
                            {order.trackingSteps.map((step, idx) => {
                              // Check if we should color the line leading to the next step
                              const showActiveLine = step.active && idx < order.trackingSteps.length - 1 && order.trackingSteps[idx + 1].active;
                              return (
                                <div key={idx} className="flex items-start space-x-3.5 relative">
                                  {/* Connecting line segment underneath the circle node */}
                                  {idx < order.trackingSteps.length - 1 && (
                                    <div
                                      className={cn(
                                        "absolute left-2.5 top-5 h-7.5 w-[2px] -translate-x-1/2 z-0",
                                        showActiveLine ? "bg-blue-600" : "bg-slate-100"
                                      )}
                                    />
                                  )}
                                  
                                  {/* Circle Node Marker */}
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full border flex items-center justify-center z-10 transition-colors duration-300 flex-shrink-0",
                                      step.active
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-200 bg-white text-slate-350"
                                    )}
                                  >
                                    {step.active ? (
                                      <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                                    ) : (
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    )}
                                  </div>
                                  
                                  <div className="text-left leading-tight">
                                    <div className="text-[11px] font-black text-slate-800">{step.label}</div>
                                    <div className="text-[9.5px] text-slate-455 font-bold mt-0.5">{step.date}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Mobile action buttons footer block */}
                      <div className="flex items-center space-x-3 select-none">
                        {order.status === 'Delivered' ? (
                          <>
                            <button
                              onClick={() => {
                                dispatch(
                                  addToCart({
                                    id: order.id,
                                    name: order.name,
                                    brand: 'REORDER',
                                    price: order.price,
                                    image: order.image,
                                    ram: 'Standard',
                                    storage: 'Standard'
                                  })
                                );
                                toast.success(`${order.name} added to cart!`, { icon: '🛒' });
                              }}
                              className="flex-grow h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center shadow cursor-pointer active:scale-95 border-none"
                            >
                              BUY AGAIN
                            </button>
                            <button className="h-12 px-6 rounded-2xl border border-slate-200/85 bg-white text-xs font-black text-slate-750 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95 shadow-sm">
                              Return
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="flex-grow h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center shadow cursor-pointer active:scale-95 border-none">
                              TRACK LIVE
                            </button>
                            <button className="h-12 px-6 rounded-2xl border border-slate-200/85 bg-white text-xs font-black text-slate-755 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95 shadow-sm">
                              Details
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </React.Fragment>
                ))
              ) : (
                <div className="bg-white border border-slate-200/60 rounded-3xl p-12 text-center text-slate-500">
                  No orders matched your search query.
                </div>
              )}
            </div>

            {/* Bottom Accessories Recommendations section */}
            <div className="space-y-4 pt-6 text-left">
              <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100">
                <Sparkles className="w-4.5 h-4.5 text-blue-655" />
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Accessories for your Tech
                </h3>
                <span className="text-[10px] text-slate-400 font-bold ml-1 hidden sm:inline">Based on your recent NeuralPro purchase</span>
              </div>

              {/* Slider grid layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                {accessories.map((acc) => (
                  <div
                    key={acc.id}
                    className="group relative bg-white border border-slate-200/60 rounded-[30px] p-4 flex flex-col justify-between hover:shadow-[0_24px_50px_rgba(15,23,42,0.04)] hover:-translate-y-1 transition-all duration-350 select-none text-left"
                  >
                    {/* Thumbnail box */}
                    <div className="relative aspect-[4/3] w-full rounded-[22px] overflow-hidden bg-slate-50 flex items-center justify-center mb-4">
                      <img
                        src={acc.image}
                        alt={acc.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-col flex-grow justify-between text-left">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none block">Accessory</span>
                        <h3 className="text-[13.5px] font-black text-slate-900 tracking-tight leading-snug mt-1 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[36px]">
                          {acc.name}
                        </h3>
                        {/* Specs tag labels */}
                        <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 rounded bg-slate-50 text-[9px] font-bold text-slate-455 border border-slate-100/80">
                            {acc.specs}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100/80 my-3" />

                      <div className="flex items-center justify-between flex-shrink-0">
                        <div className="flex flex-col text-left">
                          <Price value={acc.price} className="text-[14.5px] font-black text-slate-900 leading-none" />
                          {acc.listPrice && (
                            <Price value={acc.listPrice} className="text-[10.5px] text-slate-400 line-through font-bold mt-1" />
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddAccessoryToCart(acc);
                          }}
                          className="w-9 h-9 rounded-full bg-blue-50/70 hover:bg-blue-600 text-slate-800 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm"
                          aria-label={`Add ${acc.name} to cart`}
                        >
                          <ShoppingCart className="w-4 h-4 stroke-[2.2px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Empty orders dashboard layout (Screenshot 2) */
          <div className="w-full py-12 flex flex-col items-center justify-center text-center space-y-12">
            
            {/* Box package vector container */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                {/* Visual state marker */}
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-blue-50 text-blue-700 border border-blue-100/60 text-[9px] font-extrabold rounded-full px-2.5 py-0.5 flex items-center space-x-1 whitespace-nowrap shadow-sm">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>My Orders</span>
                </div>

                {/* Container card with empty orders icon */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-[32px] bg-white border border-slate-200/70 flex items-center justify-center shadow-lg relative overflow-hidden group p-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Visual Orders folder vector */}
                  <div className="relative w-full h-full rounded-2xl bg-blue-50/40 border border-blue-100/50 flex flex-col items-center justify-center p-4 text-blue-600">
                    <ShoppingBag className="w-16 h-16 stroke-[1.2px]" />
                    <span className="text-[10px] font-black tracking-widest uppercase mt-3">No Active Orders</span>
                    <span className="text-[8.5px] text-slate-400 font-bold mt-1 max-w-[120px] leading-tight">
                      Explore the shop items to place orders
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & subtitle details */}
              <div className="space-y-2 max-w-md mt-3 px-4">
                <h2 className="text-xl font-black text-slate-855 tracking-tight">No Orders Yet</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  You haven't placed any orders yet. Start exploring our premium tech collection and discover premium hardware designed for the future.
                </p>
              </div>
            </div>

            {/* Empty state CTA options */}
            <div className="flex items-center space-x-4 select-none">
              <button
                onClick={() => navigate('/')}
                className="h-11 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/')}
                className="h-11 px-6 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                Browse Categories
              </button>
            </div>

          </div>
        )}

      </div>
    </MainLayout>
  );
};

// Helper utility for conditional classes merge
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Orders;
