import { cookies } from 'next/headers';

export interface MiddlewareSession {
  userId: string;
  roles: string[];
}

function base64Decode(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  } catch {
    return '{}';
  }
}

export async function getMiddlewareSession(): Promise<MiddlewareSession | null> {
  const token = (await cookies()).get('bp_jwt')?.value;
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const payload = JSON.parse(base64Decode(parts[1]));
    if (!payload.sub) return null;
    return {
      userId: payload.sub,
      roles: payload.roles ?? [],
    };
  } catch {
    return null;
  }
}
