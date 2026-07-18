import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Price } from '../components/ui/Price';
import { orderService } from '../services/order.service';
import { productService } from '../services/product.service';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Truck,
  Check,
  Calendar,
  Copy,
  CreditCard,
  MapPin
} from 'lucide-react';

import ssdImg from '../assets/products/samsung_t7_ssd.jpg';
import sleeveImg from '../assets/products/laptop_sleeve_leather.jpg';
import matImg from '../assets/products/premium_desk_mat.jpg';

const formatDatetime = (isoString?: string) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatDate = (isoString?: string) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getTrackingSteps = (status: string, statusHistory: any[]) => {
  const stepsDef = [
    { label: 'Pending Payment', key: 'PENDING_PAYMENT' },
    { label: 'Processing', key: 'PROCESSING' },
    { label: 'Packed', key: 'PACKED' },
    { label: 'Shipped', key: 'SHIPPED' },
    { label: 'Out for Delivery', key: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', key: 'DELIVERED' }
  ];

  const getHistoryItem = (key: string) => {
    return statusHistory.find((h: any) => String(h.status).toUpperCase() === key);
  };

  let foundCurrent = false;
  const currentStatusUpper = status.toUpperCase().replace(/ /g, '_');

  return stepsDef.map((step) => {
    const histItem = getHistoryItem(step.key);
    let active = false;

    if (histItem) {
      active = true;
    } else if (!foundCurrent) {
      active = true;
      if (step.key === currentStatusUpper || (step.key === 'PENDING_PAYMENT' && currentStatusUpper === 'PENDING')) {
        foundCurrent = true;
      }
    }

    const date = histItem ? formatDate(histItem.timestamp) : (active ? 'Completed' : 'Expected soon');
    return {
      label: step.label,
      date,
      active
    };
  });
};

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedProducts, setResolvedProducts] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      setIsLoading(true);
      try {
        const orderData = await orderService.getOrderById(orderId);
        if (!orderData) {
          toast.error('Order not found.');
          navigate('/orders');
          return;
        }
        setOrder(orderData);

        // Fetch products in background to get images/slugs if missing
        if (orderData.items && orderData.items.length > 0) {
          const productMap: Record<string, any> = {};
          await Promise.all(
            orderData.items.map(async (item: any) => {
              try {
                const prod = await productService.getProductById(item.productId);
                if (prod) productMap[item.productId] = prod;
              } catch (e) {
                // Ignore missing product queries
              }
            })
          );
          setResolvedProducts(productMap);
        }
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to load order details.');
        navigate('/orders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId, navigate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Order ID copied to clipboard!');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse select-none">
          <div className="h-4.5 w-48 bg-slate-200 rounded" />
          <div className="bg-white border border-slate-200/50 rounded-[24px] p-6 space-y-4 shadow-sm">
            <div className="h-6 w-60 bg-slate-350 rounded" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
          </div>
          <div className="bg-white border border-slate-200/50 rounded-[24px] p-6 space-y-6 shadow-sm">
            <div className="h-5 w-32 bg-slate-300 rounded" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) return null;

  const trackingSteps = getTrackingSteps(order.orderStatus || 'Pending Payment', order.statusHistory || []);
  const grandTotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || order.totalAmount || 0;



  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-left">
        
        {/* Breadcrumb Path */}
        <nav className="text-[11px] font-black text-slate-455 uppercase tracking-widest flex items-center space-x-1.5 justify-start select-none">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Account</span>
          <span>&gt;</span>
          <Link to="/orders" className="hover:text-blue-600 transition-colors">My Orders</Link>
          <span>&gt;</span>
          <span className="text-slate-900">Order Details</span>
        </nav>

        {/* Back Link */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center space-x-2 text-[11px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-wider focus:outline-none bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </button>

        {/* Order Header Summary Card */}
        <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-black text-slate-400 font-mono tracking-tight">Order ID</span>
              <span className="text-sm font-black text-slate-900 font-mono">#{order.orderId}</span>
              <button
                onClick={() => copyToClipboard(order.orderId)}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer border-none bg-transparent"
                title="Copy Order ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[11px] text-slate-455 font-bold flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Placed {formatDatetime(order.createdAt)}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 select-none">
            {/* Status Tags */}
            <span
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 border ${
                order.orderStatus === 'Delivered'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : order.orderStatus === 'Cancelled'
                    ? 'bg-red-50 text-red-700 border-red-100'
                    : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{order.orderStatus || 'Pending'}</span>
            </span>

            <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 border ${
              order.paymentStatus === 'Paid'
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              <CreditCard className="w-3.5 h-3.5" />
              <span>{order.paymentStatus || 'Pending'}</span>
            </span>
          </div>
        </div>

        {/* Tracking Details Step Timeline */}
        <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm space-y-5">
          <h2 className="text-xs font-black text-slate-900 tracking-wider uppercase">Delivery Progress</h2>
          
          {/* Timeline steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-4 relative pt-2">
            {trackingSteps.map((step, idx) => {
              const showActiveLine = step.active && idx < trackingSteps.length - 1 && trackingSteps[idx + 1].active;
              return (
                <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center relative gap-4 md:gap-0">
                  {/* Horizontal Line connector (Desktop only) */}
                  {idx < trackingSteps.length - 1 && (
                    <div
                      className={`hidden md:block absolute top-[10px] left-[50%] w-full h-[2px] z-0 ${
                        showActiveLine ? 'bg-blue-600' : 'bg-slate-100'
                      }`}
                    />
                  )}

                  {/* Vertical Line connector (Mobile only) */}
                  {idx < trackingSteps.length - 1 && (
                    <div
                      className={`md:hidden absolute left-[10px] top-[20px] w-[2px] h-[calc(105%+24px)] z-0 ${
                        showActiveLine ? 'bg-blue-600' : 'bg-slate-100'
                      }`}
                    />
                  )}

                  {/* Circle Node Marker */}
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center z-10 transition-colors duration-300 flex-shrink-0 md:mb-2.5 ${
                      step.active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-350'
                    }`}
                  >
                    {step.active ? (
                      <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[11px] font-black text-slate-800">{step.label}</div>
                    <div className="text-[9.5px] text-slate-455 font-bold">{step.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Items Listing Card */}
        <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-black text-slate-900 tracking-wider uppercase">Items Summary</h2>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item: any, idx: number) => {
              const catalogProd = resolvedProducts[item.productId];
              const specsText = item.specifications
                ? Object.entries(item.specifications).map(([_, v]) => `${v}`).join(' • ')
                : '';
              const finalImage = catalogProd?.images?.[0]?.url || item.image || SSDImgFallback(item.name);

              return (
                <div key={idx} className="flex items-center space-x-4 py-4 first:pt-0 last:pb-0 group">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-150 overflow-hidden flex items-center justify-center p-2.5 flex-shrink-0">
                    <img src={finalImage} alt={item.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <Link to={`/product/${item.productId}`} className="text-xs font-black text-slate-900 hover:text-blue-650 transition-colors truncate block">
                      {item.name}
                    </Link>
                    <p className="text-[10px] text-slate-450 font-bold mt-0.5 truncate">
                      {item.brand} {specsText && `• ${specsText}`}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-xs font-black text-slate-950 flex-shrink-0">
                    <Price value={item.price * item.quantity} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing & Address Grid Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
          {/* Shipping details */}
          <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 pb-1.5 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-slate-450" />
              <h3 className="text-xs font-black tracking-wider uppercase">Shipping Destination</h3>
            </div>
            {order.shippingAddress ? (
              <div className="space-y-1 text-slate-600 text-xs font-bold leading-relaxed">
                <p className="text-slate-850 font-black text-[12.5px]">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                {order.shippingAddress.mobileNumber && (
                  <p className="pt-1.5 text-[10.5px] text-slate-400 font-semibold">Phone: {order.shippingAddress.mobileNumber}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-450 font-semibold">Standard Delivery Address</p>
            )}
          </div>

          {/* Payment summary details */}
          <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-2 text-slate-800 pb-1.5 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-slate-455" />
              <h3 className="text-xs font-black tracking-wider uppercase">Payment Breakdown</h3>
            </div>
            
            <div className="space-y-2 text-xs font-bold text-slate-550">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-800"><Price value={grandTotal} /></span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-slate-800">FREE</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-900 text-sm">
                <span>Total Amount</span>
                <span className="text-blue-655"><Price value={order.totalAmount || grandTotal} /></span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 font-semibold">
              Paid via {order.paymentMethod || 'Card'}
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

function SSDImgFallback(name: string) {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('mat')) return matImg;
  if (lowercaseName.includes('sleeve')) return sleeveImg;
  return ssdImg;
}
