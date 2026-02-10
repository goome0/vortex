import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { API_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from './constants';

const REMEMBER_ME_KEY = 'vortex_remember_me';
const COOKIE_PATH = '/';
const STORAGE_TOKEN_KEY = TOKEN_KEY;
const STORAGE_REFRESH_TOKEN_KEY = REFRESH_TOKEN_KEY;

function isHttpsForCookies(): boolean {
  // In production builds served over plain http (e.g., IP + port),
  // Secure cookies won't be set/sent by browsers, breaking middleware auth.
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
}

function getCookieOptions() {
  return {
    secure: isHttpsForCookies(),
    sameSite: 'strict' as const,
    path: COOKIE_PATH,
  };
}

function shouldPersistAuthCookies(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(REMEMBER_ME_KEY) === '1';
}

function getStoredToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(STORAGE_TOKEN_KEY) ?? undefined;
}

function getStoredRefreshToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY) ?? undefined;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(TOKEN_KEY) || getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get(REFRESH_TOKEN_KEY) || getStoredRefreshToken();
        if (refreshToken) {
          // Ensure only one refresh is in flight.
          const g = globalThis as typeof globalThis & {
            __vortexRefreshPromise?: Promise<{ token: string; refreshToken: string }>;
          };

          if (!g.__vortexRefreshPromise) {
            g.__vortexRefreshPromise = (async () => {
              // Backend returns { success, data: { token, refreshToken } }
              const { data: response } = await axios.post(`${API_URL}/auth/refresh-token`, {
                refreshToken,
              });

              return {
                token: response.data.token as string,
                refreshToken: response.data.refreshToken as string,
              };
            })().finally(() => {
              g.__vortexRefreshPromise = undefined;
            });
          }

          const refreshed = await g.__vortexRefreshPromise;

          const cookieOptions = getCookieOptions();
          const persistCookies = shouldPersistAuthCookies();

          Cookies.set(TOKEN_KEY, refreshed.token, {
            ...cookieOptions,
            ...(persistCookies && { expires: 7 }),
          });
          Cookies.set(REFRESH_TOKEN_KEY, refreshed.refreshToken, {
            ...cookieOptions,
            ...(persistCookies && { expires: 30 }),
          });

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_TOKEN_KEY, refreshed.token);
            window.localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, refreshed.refreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${refreshed.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove(TOKEN_KEY, { path: COOKIE_PATH });
        Cookies.remove(REFRESH_TOKEN_KEY, { path: COOKIE_PATH });
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_TOKEN_KEY);
          window.localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
        }
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Helper to extract error message from backend response
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      // Validation errors: message is an array
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      // Standard error: message is a string
      if (typeof data.message === 'string') {
        return data.message;
      }
    }
    return error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Auth API
export const authApi = {
  signIn: (username: string, password: string) =>
    api.post('/auth/sign-in', { username, password }),

  signUp: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/sign-up', data),

  getProfile: () => api.get('/auth/profile'),

  resetPassword: (newPassword: string) =>
    api.post('/auth/reset-password', { newPassword }),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
};

// WebGame API
export const webGameApi = {
  getCoins: () => api.get('/webgame/coins'),
  start: (data: Record<string, unknown>) => api.post('/webgame/start', data),
  update: (data: Record<string, unknown>) => api.post('/webgame/update', data),
};

// Admin API
export const adminApi = {
  getAccounts: () => api.get('/admin/accounts'),
  getAccount: (username: string) => api.post('/admin/account', { username }),
  updateAccount: (data: Record<string, unknown>) => api.post('/admin/account/update', data),
  addCp: (username: string, amount: number, reason?: string) =>
    api.post('/admin/account/add-cp', { username, amount, ...(reason ? { reason } : {}) }),
  scheduleCp: (username: string, amount: number, scheduledAtMs: number, reason?: string) =>
    api.post('/admin/account/schedule-cp', { username, amount, scheduledAtMs, ...(reason ? { reason } : {}) }),
  listScheduledCp: (filter?: { username?: string; status?: string }) =>
    api.post('/admin/account/scheduled-cp', filter ?? {}),
  cancelScheduledCp: (id: string) => api.post('/admin/account/scheduled-cp/cancel', { id }),
  updateScheduledCp: (data: { id: string; amount?: number; scheduledAtMs?: number; reason?: string }) =>
    api.post('/admin/account/scheduled-cp/update', data),
  // Item bundles
  createBundle: (data: { name: string; description?: string; cpCost?: number; products: number[] }) =>
    api.post('/admin/bundles/create', data),
  listBundles: (data?: { q?: string }) => api.post('/admin/bundles/list', data ?? {}),
  updateBundle: (data: { id: string; name?: string; description?: string; cpCost?: number; products?: number[] }) =>
    api.post('/admin/bundles/update', data),
  deleteBundle: (id: string) => api.post('/admin/bundles/delete', { id }),
  scheduleBundleSend: (data: { bundleId: string; usernames: string[]; scheduledAtMs?: number; reason?: string }) =>
    api.post('/admin/bundles/send', data),
  listBundleSends: (data?: { bundleId?: string }) => api.post('/admin/bundles/sends', data ?? {}),
  cancelBundleSend: (id: string) => api.post('/admin/bundles/sends/cancel', { id }),
  deleteAccount: (username: string) => api.post('/admin/account/delete', { username }),
  kickPlayer: (username: string, kick_level: number) =>
    api.post('/admin/kick-player', { username, kick_level }),
  messageWorld: (data: { world_id: number; message: string; type: string; from: string }) =>
    api.post('/admin/message-world', data),
  getOnline: (targets: { name: string; type: string }[]) =>
    api.post('/admin/online', { targets }),
  postItems: (data: { username: string; cp: number; products: number[] }) =>
    api.post('/admin/post-items', data),
  getPromos: () => api.get('/admin/promos'),
  createPromo: (data: Record<string, unknown>) => api.post('/admin/promo/create', data),
  deletePromo: (code: string) => api.post('/admin/promo/delete', { code }),
};

// Tickets API (User)
export const ticketsApi = {
  create: (data: { subject: string; message: string; category?: string; priority?: string }) =>
    api.post('/tickets', data),
  my: () => api.get('/tickets/my'),
  get: (id: string) => api.get(`/tickets/${id}`),
  addMessage: (id: string, message: string) => api.post(`/tickets/${id}/messages`, { message }),
  close: (id: string) => api.post(`/tickets/${id}/close`),
};

// Tickets API (Admin / GM Panel)
export const adminTicketsApi = {
  list: () => api.get('/admin/tickets'),
  get: (id: string) => api.get(`/admin/tickets/${id}`),
  addMessage: (id: string, message: string) => api.post(`/admin/tickets/${id}/messages`, { message }),
  resolve: (id: string, data: { message: string }) => api.post(`/admin/tickets/${id}/resolve`, data),
};

// Server Control API (Admin / GM Panel)
// Requires x-server-control-token header in addition to Bearer token.
export const serverControlApi = {
  targets: (serverControlToken: string) =>
    api.get('/admin/server/targets', { headers: { 'x-server-control-token': serverControlToken } }),
  status: (serverControlToken: string, targetId: string, data?: { dryRun?: boolean; reason?: string }) =>
    api.post(`/admin/server/${targetId}/status`, data ?? {}, { headers: { 'x-server-control-token': serverControlToken } }),
  start: (serverControlToken: string, targetId: string, data?: { dryRun?: boolean; reason?: string }) =>
    api.post(`/admin/server/${targetId}/start`, data ?? {}, { headers: { 'x-server-control-token': serverControlToken } }),
  stop: (serverControlToken: string, targetId: string, data?: { dryRun?: boolean; reason?: string }) =>
    api.post(`/admin/server/${targetId}/stop`, data ?? {}, { headers: { 'x-server-control-token': serverControlToken } }),
  restart: (serverControlToken: string, targetId: string, data?: { dryRun?: boolean; reason?: string }) =>
    api.post(`/admin/server/${targetId}/restart`, data ?? {}, { headers: { 'x-server-control-token': serverControlToken } }),
};

// Public News API
export const newsApi = {
  list: (params?: { q?: string; category?: string; limit?: number }) => api.get('/news', { params }),
  get: (idOrSlug: string) => api.get(`/news/${idOrSlug}`),
};

// Admin News API (GM Panel)
export const adminNewsApi = {
  list: (data?: { q?: string; category?: string; onlyPublished?: boolean; limit?: number }) =>
    api.post('/admin/news/list', data ?? {}),
  create: (data: {
    title: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    badgeVariant?: 'default' | 'info' | 'warning' | 'danger';
    featured?: boolean;
    readTime?: string;
    imageUrl?: string;
    isPublished?: boolean;
  }) => api.post('/admin/news/create', data),
  update: (data: {
    id: string;
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string | null;
    category?: string | null;
    badgeVariant?: 'default' | 'info' | 'warning' | 'danger';
    featured?: boolean;
    readTime?: string | null;
    imageUrl?: string | null;
    isPublished?: boolean;
  }) => api.post('/admin/news/update', data),
  delete: (id: string) => api.post('/admin/news/delete', { id }),
};
