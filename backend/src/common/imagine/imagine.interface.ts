export enum EImagineRoutes {
  // Auth
  GET_CHALLENGE = '/api/auth/get_challenge',

  // Account
  REGISTER = '/api/account/register',
  GET_CP = '/api/account/get_cp',
  GET_DETAILS = '/api/account/get_details',
  CHANGE_PASSWORD = '/api/account/change_password',
  CLIENT_LOGIN = '/api/account/client_login',

  // Admin
  GET_ACCOUNTS = '/api/admin/get_accounts',
  GET_ACCOUNT = '/api/admin/get_account',
  UPDATE_ACCOUNT = '/api/admin/update_account',
  DELETE_ACCOUNT = '/api/admin/delete_account',
  KICK_PLAYER = '/api/admin/kick_player',
  MESSAGE_WORLD = '/api/admin/message_world',
  ONLINE = '/api/admin/online',
  POST_ITEMS = '/api/admin/post_items',
  GET_PROMOS = '/api/admin/get_promos',
  CREATE_PROMO = '/api/admin/create_promo',
  DELETE_PROMO = '/api/admin/delete_promo',

  // WebGame
  WEBGAME_GET_COINS = '/api/webgame/get_coins',
  WEBGAME_START = '/api/webgame/start',
  WEBGAME_UPDATE = '/api/webgame/update',
}

/**
 * User levels (comp_hack / Imagine server).
 *
 * Source: `comp_hack/docs/guide/chapters/config.rst`
 * - 0 is a normal account
 * - any non-zero is a GM
 * - 1000 is a full GM with all permissions (also required for `/admin/*` API)
 */
export enum EUserLevel {
  NORMAL = 0,
  GM = 1,
  FULL_GM = 1000,
}
