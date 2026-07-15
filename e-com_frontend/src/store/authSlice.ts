import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  fullName?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: { email: string } | null;
  role: string | null;
  profile: UserProfile | null;
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  expiration: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('natcart_user') ? JSON.parse(localStorage.getItem('natcart_user')!) : null,
  role: localStorage.getItem('natcart_role') || null,
  profile: localStorage.getItem('natcart_profile') ? JSON.parse(localStorage.getItem('natcart_profile')!) : null,
  accessToken: localStorage.getItem('natcart_access_token') || null,
  idToken: localStorage.getItem('natcart_id_token') || null,
  refreshToken: localStorage.getItem('natcart_refresh_token') || null,
  expiration: localStorage.getItem('natcart_token_expiration') || null,
  isAuthenticated: !!localStorage.getItem('natcart_access_token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{
        accessToken: string;
        idToken: string;
        refreshToken: string;
        expiration: string;
        user: { email: string };
      }>
    ) {
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.idToken = action.payload.idToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiration = action.payload.expiration;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      localStorage.setItem('natcart_access_token', action.payload.accessToken);
      localStorage.setItem('natcart_token', action.payload.accessToken); // fallback compatibility
      localStorage.setItem('natcart_id_token', action.payload.idToken);
      localStorage.setItem('natcart_refresh_token', action.payload.refreshToken);
      localStorage.setItem('natcart_token_expiration', action.payload.expiration);
      localStorage.setItem('natcart_user', JSON.stringify(action.payload.user));
    },
    setProfile(
      state,
      action: PayloadAction<UserProfile>
    ) {
      state.profile = action.payload;
      state.role = action.payload.role || 'user';
      localStorage.setItem('natcart_profile', JSON.stringify(action.payload));
      localStorage.setItem('natcart_role', action.payload.role || 'user');
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.role = null;
      state.profile = null;
      state.accessToken = null;
      state.idToken = null;
      state.refreshToken = null;
      state.expiration = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('natcart_access_token');
      localStorage.removeItem('natcart_token');
      localStorage.removeItem('natcart_id_token');
      localStorage.removeItem('natcart_refresh_token');
      localStorage.removeItem('natcart_token_expiration');
      localStorage.removeItem('natcart_user');
      localStorage.removeItem('natcart_profile');
      localStorage.removeItem('natcart_role');
    },
  },
});

export const { loginStart, loginSuccess, setProfile, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
