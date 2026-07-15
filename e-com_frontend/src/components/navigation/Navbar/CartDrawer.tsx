import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { removeFromCart, updateQuantity } from '../../../store/cartSlice';
import { Drawer } from '../../ui/Drawer';
import { Button } from '../../ui/Button';
import { Price } from '../../ui/Price';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, discountAmount } = useSelector((state: RootState) => state.cart);

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

  // Calculations (INR synced with Cart.tsx)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50000 ? 0 : subtotal > 0 ? 1500 : 0;
  const tax = subtotal * 0.018; // 1.8% tax matching Cart.tsx
  const total = Math.max(0, subtotal - discountAmount + shipping + tax);

  const handleCheckoutClick = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Your Cart" position="right">
      <div className="flex flex-col h-full select-none text-left">
        {/* Cart items scrollable container */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {items.map((item, index) => (
            <div
              key={`${item.id}-${item.ram || ''}-${item.storage || ''}-${index}`}
              className="flex items-center space-x-3.5 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow transition-shadow relative"
            >
              {/* Product Thumbnail image */}
              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.name}</h4>
                <p className="text-[10px] font-semibold text-slate-450 mt-0.5">
                  {item.brand}
                  {item.ram && ` • ${item.ram}`}
                  {item.storage && ` • ${item.storage}`}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <Price value={item.price * item.quantity} className="text-xs text-blue-650 font-bold" />
                  
                  {/* Quantity adjusts */}
                  <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/50 rounded-lg px-1 py-0.5">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.ram, item.storage)}
                      className="w-4.5 h-4.5 flex items-center justify-center text-slate-550 hover:text-slate-900 active:scale-75 transition-all cursor-pointer font-bold"
                    >
                      <Minus className="w-2.5 h-2.5 stroke-[2px]" />
                    </button>
                    <span className="text-[10.5px] font-bold text-slate-700 min-w-[12px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.ram, item.storage)}
                      className="w-4.5 h-4.5 flex items-center justify-center text-slate-550 hover:text-slate-900 active:scale-75 transition-all cursor-pointer font-bold"
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[2px]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item.id, item.ram, item.storage)}
                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-655 cursor-pointer transition-colors p-0.5"
                aria-label="Remove item"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Empty cart placeholder */}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Your Cart is Empty</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[200px]">
                  Looks like you haven't added any premium tech to your collection yet.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 rounded-xl px-5 border-slate-250 cursor-pointer"
                onClick={onClose}
              >
                Start Exploring
              </Button>
            </div>
          )}
        </div>

        {/* Cart Drawer Summary Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3.5 select-none">
            {/* Price lines */}
            <div className="space-y-2 text-xs font-semibold text-slate-550">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <Price value={subtotal} className="text-slate-800" />
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-<Price value={discountAmount} /></span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-650 font-bold' : ''}>
                  {shipping === 0 ? 'FREE' : <Price value={shipping} />}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax Estimate</span>
                <Price value={tax} className="text-slate-800" />
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2.5 border-t border-slate-100">
                <span>Total</span>
                <Price value={total} className="text-blue-650" />
              </div>
            </div>

            {/* Checkout CTA */}
            <Button
              variant="primary"
              size="md"
              className="w-full h-11.5 rounded-xl text-[12px] font-black shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 cursor-pointer active:scale-98 bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
              onClick={handleCheckoutClick}
            >
              <span>Checkout</span>
              <span className="opacity-50 font-normal text-[10px]">•</span>
              <Price value={total} className="font-black text-white" />
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default CartDrawer;
