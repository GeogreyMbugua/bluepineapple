import { apiServer } from '@/services/api/server';
import { getServerCookie } from '@/lib/cookies/server';
import type { AuthUser } from '@blue-pineapple/iam';
import { AuthorizationError } from '@/services/api/errors';

export interface Session {
  user: AuthUser | null;
  expiresAt: number | null;
}

/**
 * Retrieve the current user session on the server.
 * Uses the JWT from cookies to fetch the current user.
 */
export async function getServerSession(): Promise<Session> {
  const token = await getServerCookie('bp_jwt');

  if (!token) {
    return { user: null, expiresAt: null };
  }

  try {
    const response = await apiServer.get<{ data: AuthUser }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Decode JWT expiry
    const expiresAt = decodeJwtExpiry(token);

    return { user: response.data, expiresAt };
  } catch {
    return { user: null, expiresAt: null };
  }
}

/**
 * Require authentication, redirect if not authenticated.
 * Returns the user or redirects to login.
 */
export async function requireAuth(): Promise<AuthUser> {
  const { user } = await getServerSession();

  if (!user) {
    throw new AuthorizationError('Authentication required');
  }

  return user;
}

/**
 * Require a specific role, throw if missing.
 */
export async function requireRole(role: string): Promise<AuthUser> {
  const user = await requireAuth();

  if (!user.roles.includes(role as never)) {
    throw new AuthorizationError(`Role '${role}' required`);
  }

  return user;
}

/**
 * Require a specific permission, throw if missing.
 */
export async function requirePermission(permission: string): Promise<AuthUser> {
  const user = await requireAuth();

  if (!user.permissions.includes(permission as never)) {
    throw new AuthorizationError(`Permission '${permission}' required`);
  }

  return user;
}

function decodeJwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '{}')) as { exp?: number };
    return (payload.exp ?? Math.floor(Date.now() / 1000) + 3600) * 1000;
  } catch {
    return Date.now() + 3600 * 1000;
  }
}