import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '../services/cart.service';
import { productService } from '../services/product.service';

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
  stock?: number;
}

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  discountAmount: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
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

const enrichCartItems = async (items: any[]): Promise<CartItem[]> => {
  if (!items || items.length === 0) return [];
  try {
    const productIds = items.map((it) => it.productId);
    const res = await productService.getProductsByIds(productIds);
    const productsList = res.data || res || [];

    return items.map((it) => {
      const p = productsList.find((x: any) => x.productId === it.productId);
      const image = p?.images && p.images.length > 0 ? p.images[0].url : '';
      return {
        id: it.productId,
        name: it.name || p?.name || 'Technology Item',
        brand: p?.brand || 'Premium',
        price: it.price || p?.price || 0,
        image: image,
        quantity: it.quantity,
        ram: p?.specifications?.ram || 'Standard',
        storage: p?.specifications?.storage || 'Standard',
        stock: p?.stock !== undefined ? p.stock : 10,
      };
    });
  } catch (err) {
    console.error('Error enriching cart items:', err);
    return items.map((it) => ({
      id: it.productId,
      name: it.name,
      brand: 'Premium',
      price: it.price,
      image: '',
      quantity: it.quantity,
      ram: 'Standard',
      storage: 'Standard',
      stock: 10,
    }));
  }
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await cartService.getCart();
      if (!cart) return [];
      const enriched = await enrichCartItems(cart.items || []);
      return enriched;
    } catch (err: any) {
      if (err.response?.status === 404 || err.status === 404) {
        return [];
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addToCartBackend = createAsyncThunk(
  'cart/addToCartBackend',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const cart = await cartService.addToCart(productId, quantity);
      const enriched = await enrichCartItems(cart.items || []);
      return enriched;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateQuantityBackend = createAsyncThunk(
  'cart/updateQuantityBackend',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const cart = await cartService.updateQuantity(productId, quantity);
      const enriched = await enrichCartItems(cart.items || []);
      return enriched;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeItemBackend = createAsyncThunk(
  'cart/removeItemBackend',
  async (productId: string, { rejectWithValue }) => {
    try {
      const cart = await cartService.removeItem(productId);
      const enriched = await enrichCartItems(cart.items || []);
      return enriched;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const clearCartBackend = createAsyncThunk(
  'cart/clearCartBackend',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return [];
    } catch (err: any) {
      if (err.response?.status === 404 || err.status === 404) {
        return [];
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState: CartState = {
  items: loadCartFromStorage(),
  discountCode: localStorage.getItem('natcart_discount_code') || null,
  discountAmount: Number(localStorage.getItem('natcart_discount_amount')) || 0,
  status: 'idle',
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Keep sync fallbacks for UI/UX compatibility
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
        state.discountAmount = 15000;
        localStorage.setItem('natcart_discount_code', code);
        localStorage.setItem('natcart_discount_amount', '15000');
      } else if (code === 'WELCOME5') {
        state.discountCode = code;
        state.discountAmount = 5000;
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'idle';
        saveCartToStorage(state.items);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addToCartBackend.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCartBackend.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'idle';
        saveCartToStorage(state.items);
      })
      .addCase(addToCartBackend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateQuantityBackend.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateQuantityBackend.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'idle';
        saveCartToStorage(state.items);
      })
      .addCase(updateQuantityBackend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(removeItemBackend.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeItemBackend.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'idle';
        saveCartToStorage(state.items);
      })
      .addCase(removeItemBackend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(clearCartBackend.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(clearCartBackend.fulfilled, (state) => {
        state.items = [];
        state.status = 'idle';
        saveCartToStorage([]);
      })
      .addCase(clearCartBackend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
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
