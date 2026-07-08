import { cookies } from 'next/headers';
import type { CookieKey } from './keys';

/**
 * Get a cookie value on the server.
 */
export async function getServerCookie(name: CookieKey): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value ?? null;
}

/**
 * Set a cookie on the server.
 * Note: Next.js allows setting cookies only in Server Actions or Route Handlers.
 */
export async function setServerCookie(
  name: CookieKey,
  value: string,
  options?: {
    expires?: Date | number;
    path?: string;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    httpOnly?: boolean;
  },
): Promise<void> {
  const cookieStore = await cookies();
  const {
    expires,
    path = '/',
    secure = true,
    sameSite = 'lax',
    httpOnly = false,
  } = options || {};

  let expiresOption: Date | undefined;
  if (expires) {
    if (expires instanceof Date) {
      expiresOption = expires;
    } else {
      expiresOption = new Date(Date.now() + expires * 24 * 60 * 60 * 1000);
    }
  }

  cookieStore.set({
    name,
    value,
    path,
    secure,
    sameSite,
    httpOnly,
    expires: expiresOption,
  });
}

/**
 * Remove a cookie on the server.
 */
export async function removeServerCookie(name: CookieKey, path: string = '/'): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({
    name,
    path,
  });
}
