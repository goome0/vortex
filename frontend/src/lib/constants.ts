export const APP_NAME = 'Vortex/Heeho Server';
export const APP_DESCRIPTION = 'Enter the wasteland. Survive. Dominate.';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6005';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  GAME: '/game',
  TICKETS: '/tickets',
  NEWS: '/news',
  DOWNLOAD: '/download',
  // Admin Routes
  ADMIN: '/admin',
  ADMIN_ACCOUNTS: '/admin/accounts',
  ADMIN_ONLINE: '/admin/online',
  ADMIN_PROMOS: '/admin/promos',
  ADMIN_ITEMS: '/admin/items',
  ADMIN_BUNDLES: '/admin/bundles',
  ADMIN_SCHEDULED_CP: '/admin/scheduled-cp',
  ADMIN_WORLD: '/admin/world',
  ADMIN_TICKETS: '/admin/tickets',
  ADMIN_SERVER: '/admin/server',
  ADMIN_NEWS: '/admin/news',
} as const;

export const TOKEN_KEY = 'vortex_token';
export const REFRESH_TOKEN_KEY = 'vortex_refresh_token';
