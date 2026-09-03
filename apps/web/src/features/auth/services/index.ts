import { authApi } from './api';
import type { AuthUser } from '../types';

export async function requestOtp(identifier: string): Promise<void> {
  await authApi.requestOtp({ identifier });
}

export async function verifyOtp(
  identifier: string,
  otp: string,
): Promise<{ user: AuthUser; expiresAt: number }> {
  const response = await authApi.verifyOtp({ identifier, otpCode: otp });
  const { user, expiresAt } = response.data;

  return { user, expiresAt };
}

export async function refreshSession(): Promise<{ user: AuthUser; expiresAt: number } | null> {
  try {
    const response = await authApi.refreshSession();
    const { user, expiresAt } = response.data;
    return { user, expiresAt };
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await authApi.logout();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await authApi.getCurrentUser();
  return response.data ?? null;
}
