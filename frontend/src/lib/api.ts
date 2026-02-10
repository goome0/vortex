import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { API_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from './constants';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(TOKEN_KEY);
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
        const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          // Backend returns { success, data: { token, refreshToken } }
          const { data: response } = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const newToken = response.data.token;
          const newRefreshToken = response.data.refreshToken;

          Cookies.set(TOKEN_KEY, newToken, { secure: true, sameSite: 'strict' });
          Cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, { secure: true, sameSite: 'strict' });

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
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
