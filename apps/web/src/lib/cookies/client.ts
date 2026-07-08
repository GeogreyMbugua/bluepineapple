import type { CookieKey } from './keys';

/**
 * Get a cookie value by key on the client.
 */
export function getCookie(name: CookieKey): string | null {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i];
    if (!c) continue;
    let cookie = c;
    while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
    if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
  }
  return null;
}

/**
 * Set a cookie on the client.
 */
export function setCookie(
  name: CookieKey,
  value: string,
  options?: {
    expires?: Date | number;
    path?: string;
    secure?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None';
  },
): void {
  if (typeof window === 'undefined') return;

  const {
    expires,
    path = '/',
    secure = true,
    sameSite = 'Lax',
  } = options || {};

  let expiresString = '';
  if (expires) {
    if (expires instanceof Date) {
      expiresString = `; expires=${expires.toUTCString()}`;
    } else {
      const date = new Date();
      date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
      expiresString = `; expires=${date.toUTCString()}`;
    }
  }

  const secureString = secure ? '; Secure' : '';
  const sameSiteString = sameSite ? `; SameSite=${sameSite}` : '';
  const pathString = `; path=${path}`;

  document.cookie = `${name}=${encodeURIComponent(value)}${expiresString}${pathString}${sameSiteString}${secureString}`;
}

/**
 * Remove a cookie on the client.
 */
export function removeCookie(name: CookieKey, path: string = '/'): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
}
