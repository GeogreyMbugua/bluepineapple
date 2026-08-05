# Admin Portal + Authentication Integration Plan

## 1. Goal

Wire the existing `@blue-pineapple/iam` package into the `apps/web` Next.js application so that an admin portal can authenticate users, enforce RBAC/ABAC policies, and protect routes. The web app currently has marketing-only pages and no backend API layer.

## 2. Current State

- `packages/iam`: Complete auth domain (OTP login, JWT sessions, RBAC, ABAC, audit, events)
- `apps/web`: Next.js 16 + React 19 marketing site with:
  - `SessionProvider` (client-side auth state)
  - `authApi` client stubs (`/auth/otp/request`, `/auth/otp/verify`, `/auth/session/refresh`, `/auth/logout`, `/auth/me`)
  - `getServerSession()` / `requireAuth()` / `requireRole()` helpers
  - Cookie helpers (`bp_jwt`)
  - No API routes, no admin UI, no middleware

## 3. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js Route Handlers** (`app/api/`) | Monorepo already uses Next.js; no separate Express server needed for MVP |
| **HTTP-only `bp_jwt` cookie** | Prevents XSS token theft; access token never exposed to JS |
| **`bp_refresh` cookie** | Persistent refresh token for silent session renewal |
| **IAM package as backend logic** | Controllers/services remain pure; Route Handlers are thin HTTP adapters |
| **Middleware for admin routes** | Next.js `middleware.ts` to protect `/admin/*` before page rendering |
| **Server Components + Server Actions** | Admin pages render on server with `getServerSession()`; mutations via Server Actions |

## 4. Implementation Phases

### Phase 1: Backend API Layer (Next.js Route Handlers)

**4.1.1 Directory Structure**

```
apps/web/src/
  app/
    api/
      auth/
        otp/
          request/
            route.ts       → POST /api/auth/otp/request
          verify/
            route.ts       → POST /api/auth/otp/verify
        session/
          refresh/
            route.ts       → POST /api/auth/session/refresh
          route.ts         → DELETE /api/auth/session (logout)
        logout/
          route.ts         → POST /api/auth/logout
        me/
          route.ts         → GET /api/auth/me
      admin/
        users/
          route.ts         → GET/POST /api/admin/users
          [id]/
            route.ts       → GET/PATCH/DELETE /api/admin/users/[id]
        partners/
          route.ts         → GET /api/admin/partners
        dashboard/
          route.ts         → GET /api/admin/dashboard
        bookings/
          route.ts         → GET /api/admin/bookings
```

**4.1.2 Shared Route Utilities**

Create `apps/web/src/lib/api/route-helpers.ts`:

```ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { AuthUser } from '@blue-pineapple/iam';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, timestamp: new Date().toISOString() }, { status });
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('bp_jwt');
  cookieStore.delete('bp_refresh');
}
```

**4.1.3 Auth Routes**

File: `apps/web/src/app/api/auth/otp/request/route.ts`

```ts
import { NextRequest } from 'next/server';
import { authController, RequestOtpSchema } from '@blue-pineapple/iam';
import { ok, fail } from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestOtpSchema.parse(body);
    const result = await authController.requestOtp(validated.identifier);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid identifier')) {
      return fail('INVALID_IDENTIFIER', 'Invalid identifier', 400);
    }
    return fail('OTP_REQUEST_FAILED', 'Failed to request OTP', 500);
  }
}
```

File: `apps/web/src/app/api/auth/otp/verify/route.ts`

```ts
import { NextRequest } from 'next/server';
import { authController, VerifyOtpSchema } from '@blue-pineapple/iam';
import { ok, fail, setAccessToken, setRefreshToken } from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = VerifyOtpSchema.parse(body);
    const result = await authController.verifyOtp(validated.identifier, validated.otpCode, {
      ipAddress: request.headers.get('x-forwarded-for') ?? request.ip ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    await setAccessToken(result.accessToken, 15 * 60 * 1000);
    await setRefreshToken(result.refreshToken);

    return ok({
      user: result.claims,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  } catch (error) {
    return fail('OTP_VERIFY_FAILED', 'Invalid or expired OTP', 401);
  }
}
```

File: `apps/web/src/app/api/auth/session/refresh/route.ts`

```ts
import { NextRequest } from 'next/server';
import { loginService, RefreshTokenSchema } from '@blue-pineapple/iam';
import { ok, fail, setAccessToken, setRefreshToken } from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RefreshTokenSchema.parse(body);
    const result = await loginService.refresh(validated.refreshToken);

    await setAccessToken(result.accessToken, 15 * 60 * 1000);
    await setRefreshToken(result.refreshToken);

    return ok({
      user: result.claims,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  } catch {
    return fail('REFRESH_FAILED', 'Invalid or expired refresh token', 401);
  }
}
```

File: `apps/web/src/app/api/auth/me/route.ts`

```ts
import { NextRequest } from 'next/server';
import { identityProvider } from '@blue-pineapple/iam';
import { getAccessToken } from '@/lib/api/route-helpers';
import { ok, fail } from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) return fail('NO_TOKEN', 'Not authenticated', 401);

  try {
    const claims = await identityProvider.authenticate(token);
    if (!claims) return fail('INVALID_SESSION', 'Session expired', 401);

    return ok({
      id: claims.sub,
      email: claims.email,
      phone: claims.phone,
      roles: claims.roles,
      permissions: claims.permissions,
      userType: claims.userType,
    });
  } catch {
    return fail('AUTH_FAILED', 'Authentication failed', 401);
  }
}
```

File: `apps/web/src/app/api/auth/logout/route.ts`

```ts
import { NextRequest } from 'next/server';
import { identityProvider } from '@blue-pineapple/iam';
import { getAccessToken, clearAuthCookies } from '@/lib/api/route-helpers';
import { ok, fail } from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      await identityProvider.logout(payload.sub, payload.sid);
    } catch {
      // best-effort logout
    }
  }

  await clearAuthCookies();
  return ok(null, 200);
}
```

**4.1.4 Admin API Routes (Protect with IAM middleware)**

File: `apps/web/src/lib/api/admin-helpers.ts`

```ts
import { NextResponse } from 'next/server';
import { authenticateRequest, authorizeRequest, type AuthenticatedRequest } from '@blue-pineapple/iam';
import { fail } from './route-helpers';

export async function requireAdminAuth(req: NextRequest): Promise<AuthenticatedRequest> {
  const authReq = { headers: req.headers } as AuthenticatedRequest;
  try {
    const user = await authenticateRequest(authReq);
    await authorizeRequest(authReq, {
      roles: ['ADMIN', 'SUPER_ADMIN'],
    });
    return authReq;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Authorization header')) {
      return fail('UNAUTHORIZED', 'Authorization header required', 401);
    }
    if (error instanceof Error && error.message.includes('Access denied')) {
      return fail('FORBIDDEN', 'Admin access required', 403);
    }
    return fail('AUTH_FAILED', 'Authentication failed', 401);
  }
}
```

Example admin route: `apps/web/src/app/api/admin/users/route.ts`

```ts
import { NextRequest } from 'next/server';
import { userService } from '@blue-pineapple/iam';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { ok, fail } from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  const authReq = await requireAdminAuth(request);
  if (authReq instanceof Response) return authReq;

  // Use IAM userService or a dedicated admin service
  // For MVP, return users from IAM package
  return ok({ users: [], total: 0 });
}

export async function POST(request: NextRequest) {
  const authReq = await requireAdminAuth(request);
  if (authReq instanceof Response) return authReq;

  try {
    const body = await request.json();
    // validate and create user via userService
    return ok({ created: true }, 201);
  } catch {
    return fail('VALIDATION_ERROR', 'Invalid request body', 400);
  }
}
```

---

### Phase 2: Client-Side Integration

**2.1 Update `authApi` to use new backend**

File: `apps/web/src/features/auth/services/api.ts`

```ts
import type { SuccessResponse } from '@/types/api';
import { apiClient } from '@/services/api';
import type { AuthUser } from '../types';

export const authApi = {
  requestOtp: (data: { identifier: string }) =>
    apiClient.post<SuccessResponse<{ sent: boolean }>>('/auth/otp/request', {
      identifier: data.identifier,
    }),

  verifyOtp: (data: { identifier: string; otpCode: string }) =>
    apiClient.post<SuccessResponse<{ token: string; refresh_token: string; user: AuthUser }>>(
      '/auth/otp/verify',
      {
        identifier: data.identifier,
        otpCode: data.otpCode,
      },
    ),

  refreshSession: () =>
    apiClient.post<SuccessResponse<{ token: string; refresh_token: string; user: AuthUser }>>(
      '/auth/session/refresh',
    ),

  logout: () => apiClient.post<SuccessResponse<null>>('/auth/logout'),

  getCurrentUser: () => apiClient.get<SuccessResponse<AuthUser>>('/auth/me'),
};
```

**2.2 Update `getServerSession` to use direct cookie**

File: `apps/web/src/lib/auth/index.ts`

```ts
import { getAccessToken, clearAuthCookies } from '@/lib/api/route-helpers';
import { identityProvider } from '@blue-pineapple/iam';
import { AuthorizationError } from '@/services/api/errors';

export async function getServerSession(): Promise<{ user: AuthUser | null; expiresAt: number | null }> {
  const token = await getAccessToken();
  if (!token) {
    await clearAuthCookies();
    return { user: null, expiresAt: null };
  }

  try {
    const claims = await identityProvider.authenticate(token);
    if (!claims) {
      await clearAuthCookies();
      return { user: null, expiresAt: null };
    }

    const expiresAt = decodeJwtExpiry(token);
    return {
      user: {
        id: claims.sub,
        email: claims.email ?? null,
        phone: claims.phone ?? null,
        roles: claims.roles,
        permissions: claims.permissions,
        userType: claims.userType,
      },
      expiresAt,
    };
  } catch {
    await clearAuthCookies();
    return { user: null, expiresAt: null };
  }
}
```

**2.3 Add silent refresh to SessionProvider**

File: `apps/web/src/providers/session-provider.tsx`

```ts
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '@/features/auth/types';
import { getCurrentUser, refreshSession, logout } from '@/features/auth/services';

interface SessionContextValue {
  readonly user: AuthUser | null;
  readonly expiresAt: number | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly refresh: () => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly updateUser: (user: AuthUser) => void;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: false,
  refresh: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function SessionProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        // No valid session
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto-refresh before expiry
  useEffect(() => {
    if (!expiresAt) return;
    const buffer = 60 * 1000; // 1 minute before expiry
    const timeout = setTimeout(() => {
      void handleRefresh();
    }, Math.max(0, expiresAt - Date.now() - buffer));
    return () => clearTimeout(timeout);
  }, [expiresAt]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await refreshSession();
      if (result) {
        setUser(result.user);
        setExpiresAt(result.expiresAt);
      } else {
        setUser(null);
        setExpiresAt(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setExpiresAt(null);
  };

  const value: SessionContextValue = {
    user,
    expiresAt,
    isAuthenticated: !!user,
    isLoading,
    refresh: handleRefresh,
    logout: handleLogout,
    updateUser: setUser,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}
```

---

### Phase 3: Middleware + Route Protection

**3.1 Next.js Middleware**

File: `apps/web/src/middleware.ts`

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession, requireRole } from '@/lib/auth';
import { getAccessToken, clearAuthCookies } from '@/lib/api/route-helpers';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const session = await getServerSession();

    if (!session.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin role
    if (!session.user.roles.includes('ADMIN' as never) && !session.user.roles.includes('SUPER_ADMIN' as never)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

**3.2 Server Component Guards**

Create `apps/web/src/app/admin/layout.tsx`:

```ts
import { redirect } from 'next/navigation';
import { getServerSession, requireRole } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session.user) {
    redirect('/login');
  }

  // Enforce admin role at page level
  if (!session.user.roles.includes('ADMIN' as never) && !session.user.roles.includes('SUPER_ADMIN' as never)) {
    redirect('/unauthorized');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

---

### Phase 4: Admin Portal Pages

**4.1 Admin Routes**

```
apps/web/src/app/
  admin/
    layout.tsx              → Admin shell (sidebar + header)
    page.tsx                → /admin → Dashboard
    login/
      page.tsx              → /admin/login (OTP-based)
    users/
      page.tsx              → /admin/users
      [id]/
        page.tsx            → /admin/users/[id]
    partners/
      page.tsx              → /admin/partners
    bookings/
      page.tsx              → /admin/bookings
    experiences/
      page.tsx              → /admin/experiences
    fleet/
      page.tsx              → /admin/fleet
```

**4.2 Admin Login Page**

File: `apps/web/src/app/admin/login/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/services/api';

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await authApi.requestOtp({ identifier });
      setStep('otp');
    } catch {
      setError('Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await authApi.verifyOtp({ identifier, otpCode: otp });
      // Check if user has admin role
      const user = result.data.user;
      if (!user.roles?.includes('ADMIN' as never) && !user.roles?.includes('SUPER_ADMIN' as never)) {
        setError('Access denied. Admin role required.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={step === 'identifier' ? handleRequestOtp : handleVerifyOtp} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        {step === 'identifier' ? (
          <>
            <input
              type="text"
              placeholder="Email or phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white rounded py-2">
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="OTP code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white rounded py-2">
              Verify
            </button>
          </>
        )}
      </form>
    </div>
  );
}
```

**4.3 Admin Dashboard**

File: `apps/web/src/app/admin/page.tsx`

```tsx
import { getServerSession } from '@/lib/auth';
import { AdminStats } from '@/components/admin/admin-stats';
import { RecentActivity } from '@/components/admin/recent-activity';

export default async function AdminDashboardPage() {
  const session = await getServerSession();
  if (!session.user) {
    // Middleware should handle, but safety check
    return null;
  }

  // Fetch dashboard data from /api/admin/dashboard
  // For MVP, use server component data fetching
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <AdminStats />
      <RecentActivity />
    </div>
  );
}
```

---

### Phase 5: Shared Admin Components

**5.1 Admin Sidebar**

File: `apps/web/src/components/admin/admin-sidebar.tsx`

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/providers/session-provider';

const navItems = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/partners', label: 'Partners' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/experiences', label: 'Experiences' },
  { href: '/admin/fleet', label: 'Fleet' },
];

export function AdminSidebar({ user }: { user: { firstName?: string | null; lastName?: string | null; roles: string[] } }) {
  const pathname = usePathname();
  const { logout } = useSession();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 border-r bg-gray-50">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Admin Portal</h2>
        <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
        <p className="text-xs text-gray-500">{user.roles.join(', ')}</p>
      </div>
      <nav className="space-y-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded text-sm ${
              isActive(item.href, item.exact)
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t mt-auto">
        <button onClick={logout} className="text-sm text-red-600 hover:text-red-700">
          Sign out
        </button>
      </div>
    </aside>
  );
}
```

---

### Phase 6: Environment & Configuration

**6.1 Environment Variables**

Add to `.env` and `.env.example`:

```env
# Auth
JWT_SECRET=your-256-bit-secret-key-here
REDIS_URL=redis://localhost:6379

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Notifications (replace ConsoleNotificationAdapter later)
OTP_SMS_PROVIDER=console
OTP_EMAIL_PROVIDER=console
```

**6.2 Package.json Scripts**

Ensure `apps/web/package.json` has:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  }
}
```

---

### Phase 7: Testing Strategy

**7.1 Unit Tests (IAM package already has vitest)**

- `packages/iam/test/authenticate.spec.ts` — extend with session validation tests
- `packages/iam/test/refresh-token.spec.ts` — extend with rotation + revocation tests

**7.2 Integration Tests (new)**

Create `apps/web/src/app/api/auth/__tests__/`:

- Test OTP request/verify flow
- Test JWT cookie setting
- Test protected route rejection without token
- Test admin role enforcement

**7.3 E2E Tests**

- Admin login → dashboard → user management → assign role → verify session
- Refresh token flow
- Logout flow

---

### Phase 8: Future Enhancements

1. **Replace `ConsoleNotificationAdapter`** with real Twilio (SMS) + SendGrid/Postmark (email)
2. **Add MFA** for SUPER_ADMIN accounts
3. **Implement ABAC policies** for resource-level access (e.g., partner can only see own bookings)
4. **Add rate limiting** at API layer (already in IAM package for OTP, extend to all routes)
5. **Add CSRF protection** for state-changing admin routes
6. **Add session management UI** (view active sessions, revoke sessions)
7. **Add audit log viewer** in admin portal

---

## 5. File Creation Checklist

### New files to create:
- [ ] `apps/web/src/app/api/auth/otp/request/route.ts`
- [ ] `apps/web/src/app/api/auth/otp/verify/route.ts`
- [ ] `apps/web/src/app/api/auth/session/refresh/route.ts`
- [ ] `apps/web/src/app/api/auth/me/route.ts`
- [ ] `apps/web/src/app/api/auth/logout/route.ts`
- [ ] `apps/web/src/lib/api/route-helpers.ts`
- [ ] `apps/web/src/lib/api/admin-helpers.ts`
- [ ] `apps/web/src/middleware.ts`
- [ ] `apps/web/src/app/admin/layout.tsx`
- [ ] `apps/web/src/app/admin/page.tsx`
- [ ] `apps/web/src/app/admin/login/page.tsx`
- [ ] `apps/web/src/app/admin/users/page.tsx`
- [ ] `apps/web/src/app/admin/partners/page.tsx`
- [ ] `apps/web/src/app/admin/bookings/page.tsx`
- [ ] `apps/web/src/components/admin/admin-sidebar.tsx`
- [ ] `apps/web/src/components/admin/admin-stats.tsx`
- [ ] `apps/web/src/app/api/admin/users/route.ts`
- [ ] `apps/web/src/app/api/admin/dashboard/route.ts`
- [ ] `apps/web/src/app/unauthorized/page.tsx`

### Files to modify:
- [ ] `apps/web/src/features/auth/services/api.ts` — update endpoint paths to `/auth/...`
- [ ] `apps/web/src/lib/auth/index.ts` — use direct cookie reading + IAM `identityProvider`
- [ ] `apps/web/src/providers/session-provider.tsx` — add auto-refresh timer
- [ ] `apps/web/.env.example` — add `JWT_SECRET`, `REDIS_URL`

---

## 6. Sequence of Implementation

1. **`route-helpers.ts`** — cookie utilities, JSON responses (foundation)
2. **Auth API routes** — `/api/auth/otp/request`, `/api/auth/otp/verify`, `/api/auth/session/refresh`, `/api/auth/me`, `/api/auth/logout`
3. **Client auth service** — update `authApi` paths to match new routes
4. **`getServerSession`** — wire to direct cookie + IAM `identityProvider`
5. **Middleware** — protect `/admin/*` routes
6. **Admin layout + login page** — shell + OTP login
7. **Admin dashboard** — server component fetching stats
8. **Admin sidebar + shared components** — navigation
9. **Admin API routes** — `/api/admin/*` with role checks
10. **Additional admin pages** — users, partners, bookings

---

## 7. Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| JWT secret not set in production | Fail fast at route handler startup; validate env on build |
| Redis not available for session cache | Session validation falls back to DB; cache is best-effort |
| CORS issues with cookie-based auth | Ensure API and web app share same origin (Next.js handles this) |
| OTP delivery fails in dev | `ConsoleNotificationAdapter` logs to console; verify in test |
| Admin role not assigned to test users | Provide seed script or manual DB insert for `ADMIN` role |

---

## 8. Success Criteria

- [ ] Admin can navigate to `/admin/login`, enter email/phone, receive OTP (console in dev)
- [ ] After OTP verification, admin is redirected to `/admin` dashboard
- [ ] Non-admin users are redirected to `/unauthorized` when accessing `/admin`
- [ ] Session persists across page refreshes via `bp_jwt` cookie
- [ ] Access token auto-refreshes before expiry
- [ ] Logout clears cookies and invalidates server-side session
- [ ] All admin API routes reject requests without valid `bp_jwt` cookie
- [ ] TypeScript compiles with no errors
- [ ] Existing marketing pages continue to work unchanged
