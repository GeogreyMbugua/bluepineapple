import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(
    { data, timestamp: new Date().toISOString() },
    { status }
  );
}

export function fail(code: string, message: string, status = 401) {
  return NextResponse.json(
    { error: { code, message }, timestamp: new Date().toISOString() },
    { status }
  );
}

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get('bp_jwt')?.value ?? null;
}

export async function setAccessToken(token: string, expiresInMs: number) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'bp_jwt',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(expiresInMs / 1000),
  });
}

export async function setRefreshToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'bp_refresh',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('bp_jwt');
  cookieStore.delete('bp_refresh');
}

export function decodeJwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '{}')) as { exp?: number };
    return (payload.exp ?? Math.floor(Date.now() / 1000) + 3600) * 1000;
  } catch {
    return Date.now() + 3600 * 1000;
  }
}
