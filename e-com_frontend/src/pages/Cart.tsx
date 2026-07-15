import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState } from '../store';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
} from '../store/cartSlice';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Price } from '../components/ui/Price';
import { Rating } from '../components/ui/Rating';

import {
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Heart,
  Bookmark,
  Check,
  Trash2,
  ShoppingCart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/cn';

// Import local images
import macbookImg from '../assets/products/macbook.jpg';
import rogImg from '../assets/products/rog.jpg';
import dellImg from '../assets/products/dell.jpg';
import ssdImg from '../assets/products/samsung_t7_ssd.jpg';
import sleeveImg from '../assets/products/laptop_sleeve_leather.jpg';
import matImg from '../assets/products/premium_desk_mat.jpg';
import emptyCartImg from '../assets/products/empty_shopping_cart.jpg';
import guideImg from '../assets/products/guide.jpg';

export const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, discountCode, discountAmount } = useSelector((state: RootState) => state.cart);
  const [couponInput, setCouponInput] = useState('');

  // Handle Qty adjust
  const handleQuantityChange = (id: string, currentQty: number, change: number, ram?: string, storage?: string) => {
    const newQty = currentQty + change;
    if (newQty < 1) {
      dispatch(removeFromCart({ id, ram, storage }));
      toast.success('Product removed from cart');
    } else {
      dispatch(updateQuantity({ id, ram, storage, quantity: newQty }));
    }
  };

  const handleRemove = (id: string, ram?: string, storage?: string) => {
    dispatch(removeFromCart({ id, ram, storage }));
    toast.success('Product removed from cart');
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    
    const code = couponInput.trim().toUpperCase();
    if (code === 'NATCART15' || code === 'WELCOME5') {
      dispatch(applyCoupon(code));
      toast.success(`Coupon "${code}" applied successfully!`, {
        icon: '🏷️',
      });
      setCouponInput('');
    } else {
      toast.error('Invalid coupon code!', {
        icon: '❌',
      });
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Helper helper to enrich the items with custom properties to match screenshots
  const enrichCartItem = (item: any) => {
    if (item.id === '1' || item.id === 'prod-macbook') {
      return {
        ...item,
        brand: 'APPLE',
        listPrice: 399900,
        saleBadge: '12% OFF',
        color: 'Silver',
        specs: 'Silver • 32GB RAM, 1TB SSD Storage',
        stockStatus: 'In Stock',
        deliveryStatus: 'Express Delivery by Tomorrow',
      };
    }
    if (item.id === '2' || item.id === 'prod-rog') {
      return {
        ...item,
        brand: 'ASUS ROG',
        listPrice: 249990,
        saleBadge: '12% OFF',
        color: 'Eclipse Gray',
        specs: 'Eclipse Gray • RTX 4070, 16GB, 1TB',
        stockStatus: 'In Stock',
        deliveryStatus: 'Standard Delivery in 3 Days',
      };
    }
    if (item.id === '3' || item.id === 'prod-dell') {
      return {
        ...item,
        brand: 'DELL',
        listPrice: 219900,
        saleBadge: '14% OFF',
        color: 'Platinum',
        specs: 'Platinum • 32GB RAM, 1TB SSD Storage',
        stockStatus: 'In Stock',
        deliveryStatus: 'Express Delivery by Tomorrow',
      };
    }
    // Accessory defaults
    if (item.id === 'acc-ssd') {
      return {
        ...item,
        brand: 'SAMSUNG',
        listPrice: 17990,
        saleBadge: '19% OFF',
        specs: 'Graphite • Rugged SSD',
        stockStatus: 'In Stock',
        deliveryStatus: 'Express Delivery by Tomorrow',
      };
    }
    if (item.id === 'acc-sleeve') {
      return {
        ...item,
        brand: 'PREMIUM ACCESSORIES',
        listPrice: 4999,
        saleBadge: '20% OFF',
        specs: 'Brown • Leather',
        stockStatus: 'In Stock',
        deliveryStatus: 'Express Delivery by Tomorrow',
      };
    }
    if (item.id === 'acc-mat') {
      return {
        ...item,
        brand: 'PREMIUM ACCESSORIES',
        listPrice: 1999,
        saleBadge: '35% OFF',
        specs: 'Charcoal Grey • Felt',
        stockStatus: 'In Stock',
        deliveryStatus: 'Express Delivery by Tomorrow',
      };
    }

    return {
      ...item,
      brand: item.brand?.toUpperCase() || 'ACCESSORIES',
      specs: `${item.ram ? item.ram : ''}${item.storage ? `, ${item.storage}` : ''}`,
      stockStatus: 'In Stock',
      deliveryStatus: 'Express Delivery by Tomorrow',
    };
  };

  // Pricing calculations (INR)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingThreshold = 50000; // Free shipping threshold in Rupees
  const isFreeShipping = subtotal >= shippingThreshold;
  const shipping = isFreeShipping ? 0 : subtotal > 0 ? 1500 : 0;
  const tax = subtotal * 0.018; // 1.8% tax matching the screenshot subtotal/tax ratio!
  const total = Math.max(0, subtotal - discountAmount + shipping + tax);

  // Accessories list (Frequently Bought Together)
  const accessories = [
    {
      id: 'acc-ssd',
      name: 'Samsung T7 Shield 2TB SSD',
      brand: 'SAMSUNG',
      price: 14499,
      listPrice: 17999,
      image: ssdImg,
      rating: 5,
      reviews: 92,
      ram: '2TB',
      storage: 'NVMe',
    },
    {
      id: 'acc-sleeve',
      name: 'Leather Laptop Sleeve 16"',
      brand: 'PREMIUM ACCESSORIES',
      price: 3999,
      listPrice: 4999,
      image: sleeveImg,
      rating: 4,
      reviews: 43,
      ram: '16-inch',
      storage: 'Leather',
    },
    {
      id: 'acc-mat',
      name: 'Premium Desk Mat Pro',
      brand: 'PREMIUM ACCESSORIES',
      price: 1299,
      listPrice: 1999,
      image: matImg,
      rating: 5,
      reviews: 114,
      ram: '900x400',
      storage: 'Felt',
    },
  ];

  // Recommended products list for empty state
  const recommendations = [
    {
      id: 'prod-macbook',
      name: 'MacBook Pro M3 Max',
      brand: 'Apple' as const,
      price: 349900,
      listPrice: 379900,
      image: macbookImg,
      rating: 5,
      reviews: 124,
      ram: '64GB' as const,
      storage: '1TB' as const,
      saleBadge: 'Sale -8%',
    },
    {
      id: 'prod-rog',
      name: 'ROG Zephyrus G16',
      brand: 'ASUS' as const,
      price: 219990,
      listPrice: 249990,
      image: rogImg,
      rating: 4,
      reviews: 89,
      ram: '32GB' as const,
      storage: '2TB' as const,
      saleBadge: 'Sale -12%',
    },
    {
      id: 'prod-dell',
      name: 'Dell XPS 15 Plus',
      brand: 'Dell' as const,
      price: 189900,
      listPrice: 219900,
      image: dellImg,
      rating: 5,
      reviews: 215,
      ram: '16GB' as const,
      storage: '512GB' as const,
      saleBadge: 'Sale -13%',
    },
    {
      id: 'prod-air',
      name: 'MacBook Air M3 Slim',
      brand: 'Apple' as const,
      price: 114900,
      listPrice: 129900,
      image: guideImg,
      rating: 5,
      reviews: 64,
      ram: '16GB' as const,
      storage: '512GB' as const,
      saleBadge: 'Sale -11%',
    },
    {
      id: 'prod-tuf',
      name: 'ASUS TUF Gaming A15',
      brand: 'ASUS' as const,
      price: 104900,
      listPrice: 119900,
      image: rogImg,
      rating: 4,
      reviews: 43,
      ram: '16GB' as const,
      storage: '1TB' as const,
      saleBadge: 'Sale -12%',
    },
  ];

  const handleAddAccessory = (acc: typeof accessories[0]) => {
    dispatch(
      addToCart({
        id: acc.id,
        name: acc.name,
        brand: acc.brand,
        price: acc.price,
        image: acc.image,
        ram: acc.ram,
        storage: acc.storage,
      })
    );
  };

  return (
    <MainLayout>
      <div className="w-full flex flex-col items-stretch space-y-6 select-none text-left">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-350" />
          <span className="text-slate-600">Cart</span>
        </div>

        {items.length > 0 ? (
          <>
            {/* Page Header */}
            <div className="flex flex-col space-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Shopping Cart ({items.reduce((sum, item) => sum + item.quantity, 0)} Items)
              </h1>
            </div>

            {/* Main Cart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Cart items & Carousels */}
              <div className="lg:col-span-2 space-y-8">
                {/* Cart Items List */}
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const enriched = enrichCartItem(item);
                    return (
                      <div
                        key={`${item.id}-${item.ram || ''}-${item.storage || ''}-${index}`}
                        className="p-4 sm:p-5 bg-white border border-slate-200/70 rounded-[24px] shadow-[0_4px_25px_rgba(15,23,42,0.01)] flex flex-col items-stretch gap-4 relative group"
                      >
                        {/* Upper Segment: Item Detail & Price */}
                        <div className="flex items-start justify-between gap-3 sm:gap-4 w-full">
                          {/* Image & Title Details */}
                          <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                            <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                              <img src={enriched.image} alt={enriched.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow min-w-0 flex flex-col text-left">
                              <span className="text-[9px] sm:text-[10px] font-black text-blue-600 tracking-wider uppercase">
                                {enriched.brand}
                              </span>
                              <h3 className="text-[13px] sm:text-[14.5px] font-black text-slate-850 tracking-tight leading-tight mt-0.5 truncate">
                                {enriched.name}
                              </h3>
                              <p className="text-[10px] sm:text-[11px] font-bold text-slate-450 mt-1">
                                {enriched.specs}
                              </p>

                              {/* Availability Badges */}
                              <div className="flex items-center mt-2.5 text-[9.5px] sm:text-[10.5px] font-bold">
                                <span className="text-green-600 flex items-center space-x-1">
                                  <Check className="w-3.5 h-3.5 stroke-[3px] flex-shrink-0" />
                                  <span>{enriched.stockStatus}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price Stack details (Right side top align) */}
                          <div className="flex flex-col items-end text-right flex-shrink-0">
                            <Price value={enriched.price * enriched.quantity} className="text-[14px] sm:text-base font-black text-slate-900" />
                            {enriched.listPrice && (
                              <div className="flex items-center space-x-1.5 mt-1">
                                <Price value={enriched.listPrice * enriched.quantity} className="text-[10px] sm:text-[11px] text-slate-400 line-through font-bold" />
                                <span className="text-[9px] sm:text-[10px] font-black text-red-500 bg-red-50 border border-red-100/50 rounded-lg px-1.5 py-0.5">
                                  {enriched.saleBadge}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lower Segment: Quantity Changer & Actions */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 w-full mt-1.5">
                          {/* Quantity adjustments */}
                          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/50 rounded-xl px-2 py-0.5 shadow-sm">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.ram, item.storage)}
                              className="w-5.5 h-5.5 flex items-center justify-center text-slate-550 hover:text-slate-900 active:scale-75 transition-all cursor-pointer font-bold"
                            >
                              <Minus className="w-3 h-3 stroke-[2.5px]" />
                            </button>
                            <span className="text-xs font-black text-slate-700 min-w-[16px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.ram, item.storage)}
                              className="w-5.5 h-5.5 flex items-center justify-center text-slate-550 hover:text-slate-900 active:scale-75 transition-all cursor-pointer font-bold"
                            >
                              <Plus className="w-3 h-3 stroke-[2.5px]" />
                            </button>
                          </div>

                          {/* Action Items List */}
                          <div className="flex items-center space-x-3.5 text-xs font-bold text-slate-500">
                            <button
                              className="flex items-center space-x-1 hover:text-blue-650 transition-colors cursor-pointer"
                              title="Save for Later"
                            >
                              <Bookmark className="w-4 h-4 text-slate-400" />
                              <span className="hidden sm:inline">Save for Later</span>
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                              title="Add to Wishlist"
                            >
                              <Heart className="w-4 h-4 text-slate-400" />
                              <span className="hidden sm:inline">Wishlist</span>
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              onClick={() => handleRemove(item.id, item.ram, item.storage)}
                              className="flex items-center space-x-1 hover:text-red-655 transition-colors cursor-pointer text-slate-500 hover:bg-transparent"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                              <span className="text-red-655">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Frequently Bought Together section (Desktop) */}
                <div className="space-y-4 pt-4 hidden lg:block">
                  <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                    <Sparkles className="w-4.5 h-4.5 text-blue-650" />
                    <h3 className="text-[13.5px] font-black text-slate-800 tracking-tight">
                      Frequently Bought Together
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                    {accessories.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => navigate(`/product/${acc.id}`)}
                        className="p-3.5 rounded-[28px] border border-slate-200/50 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-350 flex flex-col justify-between items-stretch overflow-hidden group cursor-pointer"
                      >
                        {/* Thumbnail image */}
                        <div className="relative w-full aspect-[4/3] rounded-[22px] bg-slate-50/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img
                            src={acc.image}
                            alt={acc.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                          />
                        </div>

                        {/* Content Container */}
                        <div className="flex flex-col flex-grow justify-between text-left mt-3">
                          <div className="space-y-1 mb-2">
                            <span className="text-[10px] font-black text-blue-655 tracking-wider uppercase">{acc.brand}</span>
                            <h4 className="text-[13.5px] font-extrabold text-slate-800 tracking-tight leading-tight mt-1 truncate w-full">
                              {acc.name}
                            </h4>
                            <div className="flex items-center space-x-1 pt-1">
                              <Rating value={acc.rating} readOnly size="sm" />
                              <span className="text-[10.5px] text-slate-800 font-bold ml-1.5">({acc.reviews})</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                                {acc.ram.includes('RAM') || acc.ram.includes('GB') ? (acc.ram.includes('RAM') ? acc.ram : `${acc.ram} RAM`) : `${acc.ram} RAM`}
                              </span>
                              <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                                {acc.storage.includes('SSD') ? acc.storage : `${acc.storage} SSD`}
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
                                handleAddAccessory(acc);
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
              </div>

              {/* Right Column: Order Summary details - Sticky on desktop */}
              <aside className="col-span-1 lg:sticky lg:top-20 lg:self-start space-y-5">
                <Card variant="simple" className="p-6 border-slate-200 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] text-left">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 mb-5">
                    Order Summary
                  </h3>

                  {/* Summary Rows */}
                  <div className="space-y-3.5 text-xs font-semibold text-slate-550 mb-5">
                    <div className="flex justify-between">
                      <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <Price value={subtotal} className="text-slate-850" />
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1.5">
                        <div className="flex items-center space-x-1">
                          <span>Cart Discount</span>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-500 hover:text-red-700 font-bold text-[10px] ml-1 cursor-pointer"
                            title="Remove coupon"
                          >
                            (Remove)
                          </button>
                        </div>
                        <span>-<Price value={discountAmount} /></span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className={cn(shipping === 0 ? "text-green-600 font-bold" : "text-slate-800")}>
                        {shipping === 0 ? 'FREE' : <Price value={shipping} />}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Tax (Estimated)</span>
                      <Price value={tax} className="text-slate-800" />
                    </div>

                    <div className="flex justify-between text-sm font-black text-slate-900 pt-3.5 border-t border-slate-100">
                      <span>Total</span>
                      <Price value={total} className="text-blue-600 text-base" />
                    </div>
                  </div>

                  {/* Coupon Code input widget with inline button */}
                  <div className="relative flex items-center mb-6">
                    <input
                      type="text"
                      placeholder="Apply Coupon"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full h-10 text-[11px] font-semibold border border-slate-355 rounded-[12px] pl-3 pr-14 text-slate-700 outline-none focus:border-blue-600 transition-colors bg-white shadow-sm"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="absolute right-3.5 text-[11px] font-black text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Coupon hint note */}
                  {!discountCode && (
                    <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-2.5 text-[9.5px] font-bold text-blue-700 mb-5 leading-snug flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span>Use coupon code <b>NATCART15</b> to save ₹15,000 instantly!</span>
                    </div>
                  )}

                  {/* Checkout CTA */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full h-12 rounded-full text-[11px] font-black shadow-lg shadow-blue-500/10 flex items-center justify-center cursor-pointer active:scale-98 bg-blue-600 hover:bg-blue-700 text-white transition-all uppercase tracking-widest"
                    onClick={handleCheckout}
                  >
                    <span className="tracking-[0.2em] translate-x-[0.1em]">CHECKOUT</span>
                  </Button>
                </Card>

                {/* Secure checkout info */}
                <Card variant="simple" className="p-4 border-slate-200 bg-white rounded-2xl shadow-sm text-left flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5 text-slate-500" />
                  </div>
                  <div className="flex-grow text-[9.5px] leading-relaxed text-slate-450 font-bold">
                    <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-0.5">Secure Payment Guarantee</h4>
                    <span>Your transaction is encrypted and protected by NatCart Secure Systems. We accept major credit cards, PayPal, and digital wallets.</span>
                  </div>
                </Card>

                {/* Need help support links */}
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold">
                    Need help? <Link to="#" className="text-blue-650 hover:underline">Chat with Support</Link>
                  </span>
                </div>
              </aside>
            </div>

            {/* Frequently Bought Together section (Mobile only) */}
            <div className="space-y-4 pt-4 block lg:hidden mt-8">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                <h3 className="text-[13.5px] font-black text-slate-800 tracking-tight">
                  Frequently Bought Together
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {accessories.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => navigate(`/product/${acc.id}`)}
                    className="p-3.5 rounded-[28px] border border-slate-200/50 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-350 flex flex-col justify-between items-stretch overflow-hidden group cursor-pointer"
                  >
                    {/* Thumbnail image */}
                    <div className="relative w-full aspect-[4/3] rounded-[22px] bg-slate-50/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img
                        src={acc.image}
                        alt={acc.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-col flex-grow justify-between text-left mt-3">
                      <div className="space-y-1 mb-2">
                        <span className="text-[10px] font-black text-blue-655 tracking-wider uppercase">{acc.brand}</span>
                        <h4 className="text-[13.5px] font-extrabold text-slate-800 tracking-tight leading-tight mt-1 truncate w-full">
                          {acc.name}
                        </h4>
                        <div className="flex items-center space-x-1 pt-1">
                          <Rating value={acc.rating} readOnly size="sm" />
                          <span className="text-[10.5px] text-slate-800 font-bold ml-1.5">({acc.reviews})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                            {acc.ram.includes('RAM') || acc.ram.includes('GB') ? (acc.ram.includes('RAM') ? acc.ram : `${acc.ram} RAM`) : `${acc.ram} RAM`}
                          </span>
                          <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                            {acc.storage.includes('SSD') ? acc.storage : `${acc.storage} SSD`}
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
                            handleAddAccessory(acc);
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
          /* Empty Cart State */
          <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-12">
            {/* Center Shopping Cart graphic */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                {/* Visual tooltip bubble */}
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[9px] font-extrabold rounded-full px-2.5 py-0.5 flex items-center space-x-1 whitespace-nowrap shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Smart Cart</span>
                </div>

                {/* White Container card with realistic metallic shopping cart */}
                <div className="w-36 h-36 rounded-3xl bg-white border border-slate-200/70 flex items-center justify-center shadow-lg relative overflow-hidden group p-4">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img src={emptyCartImg} alt="Shopping Cart" className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-350" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm mt-3">
                <h2 className="text-xl font-black text-slate-850 tracking-tight">Your Cart is Empty</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Looks like you haven't added anything yet. Explore our latest technology products and find the perfect upgrade for your digital workflow.
                </p>
              </div>

              <div className="flex items-center space-x-2.5 sm:space-x-3.5 pt-2.5">
                <Button
                  variant="primary"
                  size="md"
                  className="rounded-xl text-xs font-black px-5 sm:px-6 cursor-pointer active:scale-95 flex items-center whitespace-nowrap"
                  onClick={() => navigate('/')}
                >
                  <span>Start Shopping</span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="rounded-xl text-xs font-black px-5 sm:px-6 cursor-pointer border-slate-250 active:scale-95 bg-white text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  onClick={() => navigate('/')}
                >
                  Explore Categories
                </Button>
              </div>
            </div>

            {/* Recommended for You carousel below */}
            <div className="w-full space-y-6 pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-left">
                  <Sparkles className="w-4.5 h-4.5 text-blue-650" />
                  <h3 className="text-sm font-black text-slate-850 tracking-tight">
                    Recommended for You
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
                {recommendations.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => navigate(`/product/${prod.id}`)}
                    className="p-3.5 rounded-[28px] border border-slate-200/50 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-350 flex flex-col justify-between items-stretch overflow-hidden group cursor-pointer"
                  >
                    {/* Thumbnail image */}
                    <div className="relative w-full aspect-[4/3] rounded-[22px] bg-slate-50/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                      {prod.saleBadge && (
                        <div className="absolute top-3 left-3 bg-white border border-red-500/80 text-red-550 font-black text-[9.5px] tracking-wide uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                          {prod.saleBadge}
                        </div>
                      )}
                    </div>

                    {/* Content Container */}
                    <div className="flex flex-col flex-grow justify-between text-left mt-3">
                      <div className="space-y-1 mb-2">
                        <span className="text-[10px] font-black text-blue-655 tracking-wider uppercase">{prod.brand}</span>
                        <h4 className="text-[13.5px] font-extrabold text-slate-800 tracking-tight leading-tight mt-1 truncate w-full">
                          {prod.name}
                        </h4>
                        <div className="flex items-center space-x-1 pt-1">
                          <Rating value={prod.rating} readOnly size="sm" />
                          <span className="text-[10.5px] text-slate-800 font-bold ml-1.5">({prod.reviews})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                            {prod.ram.includes('RAM') || prod.ram.includes('GB') ? (prod.ram.includes('RAM') ? prod.ram : `${prod.ram} RAM`) : `${prod.ram} RAM`}
                          </span>
                          <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                            {prod.storage.includes('SSD') ? prod.storage : `${prod.storage} SSD`}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100/80 my-3" />

                      <div className="flex items-center justify-between flex-shrink-0">
                        <div className="flex flex-col text-left">
                          <Price value={prod.price} className="text-[14.5px] font-black text-slate-900 leading-none" />
                          {prod.listPrice && (
                            <Price value={prod.listPrice} className="text-[10.5px] text-slate-400 line-through font-bold mt-1" />
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(
                              addToCart({
                                id: prod.id,
                                name: prod.name,
                                brand: prod.brand,
                                price: prod.price,
                                image: prod.image,
                                ram: prod.ram,
                                storage: prod.storage,
                              })
                            );
                          }}
                          className="w-9 h-9 rounded-full bg-blue-50/70 hover:bg-blue-600 text-slate-800 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm"
                        >
                          <ShoppingCart className="w-4 h-4 stroke-[2.2px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Cart;
