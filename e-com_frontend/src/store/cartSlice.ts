import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  ram?: string;
  storage?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  discountAmount: number;
}

const loadCartFromStorage = (): CartItem[] => {
  try {
    const data = localStorage.getItem('natcart_shopping_cart');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem('natcart_shopping_cart', JSON.stringify(items));
  } catch (e) {
    console.error('Error saving cart data', e);
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  discountCode: localStorage.getItem('natcart_discount_code') || null,
  discountAmount: Number(localStorage.getItem('natcart_discount_amount')) || 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartItem, 'quantity'>>) {
      const existing = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.ram === action.payload.ram &&
          item.storage === action.payload.storage
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart(
      state,
      action: PayloadAction<{ id: string; ram?: string; storage?: string }>
    ) {
      state.items = state.items.filter(
        (item) =>
          !(
            item.id === action.payload.id &&
            item.ram === action.payload.ram &&
            item.storage === action.payload.storage
          )
      );
      saveCartToStorage(state.items);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ id: string; ram?: string; storage?: string; quantity: number }>
    ) {
      const target = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.ram === action.payload.ram &&
          item.storage === action.payload.storage
      );
      if (target) {
        target.quantity = Math.max(1, action.payload.quantity);
      }
      saveCartToStorage(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.discountCode = null;
      state.discountAmount = 0;
      saveCartToStorage([]);
      localStorage.removeItem('natcart_discount_code');
      localStorage.removeItem('natcart_discount_amount');
    },
    applyCoupon(state, action: PayloadAction<string>) {
      const code = action.payload.toUpperCase();
      if (code === 'NATCART15') {
        state.discountCode = code;
        state.discountAmount = 15000; // Flat ₹15,000 discount
        localStorage.setItem('natcart_discount_code', code);
        localStorage.setItem('natcart_discount_amount', '15000');
      } else if (code === 'WELCOME5') {
        state.discountCode = code;
        state.discountAmount = 5000; // Flat ₹5,000 discount
        localStorage.setItem('natcart_discount_code', code);
        localStorage.setItem('natcart_discount_amount', '5000');
      } else {
        state.discountCode = null;
        state.discountAmount = 0;
        localStorage.removeItem('natcart_discount_code');
        localStorage.removeItem('natcart_discount_amount');
      }
    },
    removeCoupon(state) {
      state.discountCode = null;
      state.discountAmount = 0;
      localStorage.removeItem('natcart_discount_code');
      localStorage.removeItem('natcart_discount_amount');
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
