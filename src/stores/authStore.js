import { create } from 'zustand';
import { decodeToken, isTokenExpired } from '../utils/auth';
import { useCloudStore } from './cloudStore';

const STORAGE_KEY = 'pulsar-auth';

/**
 * Load persisted auth state from localStorage
 */
function loadPersistedAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const { accessToken, idToken, refreshToken } = JSON.parse(stored);

    // Check if access token is expired
    if (isTokenExpired(accessToken)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const userInfo = decodeToken(idToken);
    return { accessToken, idToken, refreshToken, userInfo };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

const initialAuth = loadPersistedAuth();

export const useAuthStore = create((set, get) => ({
  // State
  isAuthenticated: !!initialAuth,
  accessToken: initialAuth?.accessToken || null,
  idToken: initialAuth?.idToken || null,
  refreshToken: initialAuth?.refreshToken || null,
  userInfo: initialAuth?.userInfo || null,
  isLoading: false,

  // Actions
  setTokens: (tokens) => {
    const { access_token, id_token, refresh_token } = tokens;
    const userInfo = decodeToken(id_token);

    // Persist to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: access_token,
        idToken: id_token,
        refreshToken: refresh_token,
      })
    );

    set({
      isAuthenticated: true,
      accessToken: access_token,
      idToken: id_token,
      refreshToken: refresh_token,
      userInfo,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    useCloudStore.getState().clear(); // Clear cloud state on logout
    set({
      isAuthenticated: false,
      accessToken: null,
      idToken: null,
      refreshToken: null,
      userInfo: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  // Get access token for API calls (returns null if expired)
  getAccessToken: () => {
    const { accessToken, logout } = get();
    if (!accessToken || isTokenExpired(accessToken)) {
      logout();
      return null;
    }
    return accessToken;
  },
}));
