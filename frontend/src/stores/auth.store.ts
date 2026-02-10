import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import { authApi, getErrorMessage } from '@/lib/api';

const REMEMBER_ME_KEY = 'vortex_remember_me';
const COOKIE_PATH = '/';
const STORAGE_TOKEN_KEY = TOKEN_KEY;
const STORAGE_REFRESH_TOKEN_KEY = REFRESH_TOKEN_KEY;

function getCookieOptions(): Cookies.CookieAttributes {
  // If the site is served over plain http (common on IP-based servers),
  // "secure: true" will prevent the browser from setting/sending the cookie.
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  return {
    secure: isHttps,
    sameSite: 'strict',
    path: COOKIE_PATH,
  };
}

export interface User {
  username: string;
  email: string;
  disp_name: string;
  user_level: number;
  cp: number;
  ticket_count: number;
  enabled: boolean;
  last_login: number;
  character_count: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  set: (partial: Partial<AuthState>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      set: (partial) => set(partial),
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (username, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const { data: response } = await authApi.signIn(username, password);
          // Backend response: { success, data: { username, disp_name, email, user_level, cp, ticket_count, token, refreshToken } }
          const userData = response.data;

          // When rememberMe is false, don't set expires — cookie becomes session-only (deleted on browser close)
          const cookieOptions = getCookieOptions();

          Cookies.set(TOKEN_KEY, userData.token, {
            ...cookieOptions,
            ...(rememberMe && { expires: 7 }),
          });
          Cookies.set(REFRESH_TOKEN_KEY, userData.refreshToken, {
            ...cookieOptions,
            ...(rememberMe && { expires: 30 }),
          });

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? '1' : '0');
            window.localStorage.setItem(STORAGE_TOKEN_KEY, userData.token);
            window.localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, userData.refreshToken);
          }

          const user: User = {
            username: userData.username,
            email: userData.email,
            disp_name: userData.disp_name,
            user_level: userData.user_level,
            cp: userData.cp,
            ticket_count: userData.ticket_count,
            enabled: true,
            last_login: 0,
            character_count: 0,
          };

          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } catch (error: unknown) {
          set({ error: getErrorMessage(error), isLoading: false });
          return false;
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data: response } = await authApi.signUp({ username, email, password });
          // Backend response: { success, data: { username, email, token, refreshToken } }
          const userData = response.data;

          const cookieOptions = getCookieOptions();
          Cookies.set(TOKEN_KEY, userData.token, { 
            ...cookieOptions,
            expires: 7
          });
          Cookies.set(REFRESH_TOKEN_KEY, userData.refreshToken, { 
            ...cookieOptions,
            expires: 30
          });

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(REMEMBER_ME_KEY, '1');
            window.localStorage.setItem(STORAGE_TOKEN_KEY, userData.token);
            window.localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, userData.refreshToken);
          }

          const user: User = {
            username: userData.username,
            email: userData.email,
            disp_name: userData.username,
            user_level: 0,
            cp: 0,
            ticket_count: 0,
            enabled: true,
            last_login: 0,
            character_count: 0,
          };

          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } catch (error: unknown) {
          set({ error: getErrorMessage(error), isLoading: false });
          return false;
        }
      },

      logout: () => {
        Cookies.remove(TOKEN_KEY, { path: COOKIE_PATH });
        Cookies.remove(REFRESH_TOKEN_KEY, { path: COOKIE_PATH });
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(REMEMBER_ME_KEY);
          window.localStorage.removeItem(STORAGE_TOKEN_KEY);
          window.localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
        }
        set({ user: null, isAuthenticated: false });
        window.location.href = '/';
      },

      fetchProfile: async () => {
        const token =
          Cookies.get(TOKEN_KEY) ||
          (typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_TOKEN_KEY) ?? undefined : undefined);
        if (!token) return;

        set({ isLoading: true });
        try {
          const { data: response } = await authApi.getProfile();
          // Backend response: { success, data: { username, email, disp_name, cp, ticket_count, user_level, enabled, last_login, character_count } }
          const profileData = response.data;

          const user: User = {
            username: profileData.username,
            email: profileData.email,
            disp_name: profileData.disp_name,
            user_level: profileData.user_level,
            cp: profileData.cp,
            ticket_count: profileData.ticket_count,
            enabled: profileData.enabled,
            last_login: profileData.last_login,
            character_count: profileData.character_count,
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          Cookies.remove(TOKEN_KEY, { path: COOKIE_PATH });
          Cookies.remove(REFRESH_TOKEN_KEY, { path: COOKIE_PATH });
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(STORAGE_TOKEN_KEY);
            window.localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
          }
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'vortex-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        state?.set({ isHydrated: true });
      },
    }
  )
);
