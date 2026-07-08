import { authApi } from './api';
import { COOKIE_KEYS, setCookie, removeCookie } from '@/lib/cookies';
import type { AuthUser } from '../types';

export { authApi } from './api';
export type { AuthUser } from '../types';

export async function requestOtp(channel: 'email' | 'sms', value: string): Promise<void> {
  await authApi.requestOtp({ channel, value });
}

export async function verifyOtp(
  channel: 'email' | 'sms',
  value: string,
  otp: string,
): Promise<{ user: AuthUser; expiresAt: number }> {
  const response = await authApi.verifyOtp({ channel, value, otp });
  const { token, refresh_token, user } = response.data;

  const expiresAt = decodeJwtExpiry(token);

  setCookie(COOKIE_KEYS.JWT, token, { expires: new Date(expiresAt) });
  setCookie(COOKIE_KEYS.REFRESH_TOKEN, refresh_token);

  return { user, expiresAt };
}

export async function refreshSession(): Promise<{ user: AuthUser; expiresAt: number } | null> {
  try {
    const response = await authApi.refreshSession();
    const { token, refresh_token, user } = response.data;

    const expiresAt = decodeJwtExpiry(token);

    setCookie(COOKIE_KEYS.JWT, token, { expires: new Date(expiresAt) });
    setCookie(COOKIE_KEYS.REFRESH_TOKEN, refresh_token);

    return { user, expiresAt };
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await authApi.logout();
  removeCookie(COOKIE_KEYS.JWT);
  removeCookie(COOKIE_KEYS.REFRESH_TOKEN);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await authApi.getCurrentUser();
  return response.data;
}

function decodeJwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '{}')) as { exp?: number };
    return (payload.exp ?? Math.floor(Date.now() / 1000) + 3600) * 1000;
  } catch {
    return Date.now() + 3600 * 1000;
  }
}