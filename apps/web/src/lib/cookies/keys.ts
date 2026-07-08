export const COOKIE_KEYS = {
  JWT: 'bp_jwt',
  REFRESH_TOKEN: 'bp_refresh_token',
  THEME: 'bp_theme',
  LOCALE: 'bp_locale',
} as const;

export type CookieKey = typeof COOKIE_KEYS[keyof typeof COOKIE_KEYS];
