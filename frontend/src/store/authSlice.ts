import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/auth';

const TOKEN_KEY = 'veda_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
}

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, action.payload.token);
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    hydrateToken: (state) => {
      const token = readToken();
      state.token = token;
    },
  },
});

export const {
  setAuthLoading,
  setCredentials,
  setUser,
  logout,
  setInitialized,
  hydrateToken,
} = authSlice.actions;

export default authSlice.reducer;
