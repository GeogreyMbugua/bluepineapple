# Implementation Plan - Blue Pineapple Application Layer

Implement the reusable application infrastructure layer that connects the Next.js 16 frontend architecture to the backend domains. This foundation will be consumed by all future feature components and strictly follows the established domain-driven design and architectural boundaries.

## User Review Required

> [!IMPORTANT]
> The environment variable Zod validation will throw an error immediately on server startup or client load if any variables are missing. To ensure that `pnpm build` passes locally and in CI/CD without manual environment setup, we will create a default `.env` file in `apps/web/` containing valid dev-defaults (e.g. dummy keys).

> [!NOTE]
> The monorepo has an existing empty `booking/` feature folder, but the prompt requests the creation of `bookings/` services and API client. To maintain backwards compatibility and satisfy the prompt, we will implement the API client and services under **both** directories (`booking/` and `bookings/`), or create a symlink/re-export to ensure no future integrations break.

## Open Questions

None at this time. The architecture requirements are well-defined and match the monorepo's established patterns.

## Proposed Changes

### Configuration Layer

#### [MODIFY] [env.ts](file:///home/bkg/blue-pineapple/apps/web/src/config/env.ts)
- Update env schema with Zod to validate:
  - `NODE_ENV`
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
  - `NEXT_PUBLIC_ENVIRONMENT`
  - `NEXT_PUBLIC_ENABLE_ANALYTICS`
- Perform `.parse(process.env)` immediately and export `env`.
- Ensure it does not read or expose any server-only variables.

#### [NEW] [.env](file:///home/bkg/blue-pineapple/apps/web/.env)
- Add default environment variables for local development and build compatibility.

---

### Shared Request & Response Types

#### [DELETE] [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/types/api.ts)
- Delete in favor of directory-based type system to avoid module resolution conflicts.

#### [NEW] [index.ts](file:///home/bkg/blue-pineapple/apps/web/src/types/api/index.ts)
- Define new shared API request/response types:
  - `Pagination`
  - `Cursor`
  - `ErrorResponse`
  - `SuccessResponse`
  - `ApiList`
  - `ApiMeta`
  - `ValidationError`
- Keep and support existing types to prevent breaking imports:
  - `ApiResponse`
  - `PaginatedResponse`
  - `PaginationMeta`
  - `ApiErrorResponse`
  - `ApiValidationError`
  - `HttpMethod`
  - `ApiRequestConfig`

#### [MODIFY] [index.ts](file:///home/bkg/blue-pineapple/apps/web/src/types/index.ts)
- Re-export everything from `./api` to support existing import paths.

---

### Cookie Utilities

#### [NEW] [keys.ts](file:///home/bkg/blue-pineapple/apps/web/src/lib/cookies/keys.ts)
- Declare typed cookie keys: `JWT`, `REFRESH_TOKEN`, `THEME`, `LOCALE`.

#### [NEW] [client.ts](file:///home/bkg/blue-pineapple/apps/web/src/lib/cookies/client.ts)
- Implement pure client-side cookie helpers (`getCookie`, `setCookie`, `removeCookie`) using `document.cookie` without server dependencies.

#### [NEW] [server.ts](file:///home/bkg/blue-pineapple/apps/web/src/lib/cookies/server.ts)
- Implement server-side cookie helpers (`getServerCookie`, `setServerCookie`, `removeServerCookie`) using `next/headers` `cookies()`.

#### [NEW] [index.ts](file:///home/bkg/blue-pineapple/apps/web/src/lib/cookies/index.ts)
- Barrel-export cookie keys, client-side helpers, and dynamically imported server-side helpers to keep client components clean of server-only modules.

---

### API Error Mapping

#### [MODIFY] [errors.ts](file:///home/bkg/blue-pineapple/apps/web/src/services/api/errors.ts)
- Create new typed domain errors:
  - `ConflictError` (409)
  - `RateLimitError` (429)
  - `InternalServerError` (500)
- Update `parseApiError` to map 409, 429, 500 status codes.
- Ensure fetcher maps all network and timeout failures to `NetworkError`.

---

### Feature API Clients

Add the API client file mapping frontend requests to backend endpoints for each feature domain.

#### [NEW] [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/auth/services/api.ts)
- Map OTP and session endpoints.

#### [NEW] [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/crm/services/api.ts)
- Map CRM and customer endpoints.

#### [NEW] [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/bookings/services/api.ts) & [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/booking/services/api.ts)
- Map bookings endpoints.

#### [NEW] [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/experiences/services/api.ts)
- Map experience endpoints.

#### [NEW] [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/operations/services/api.ts)
- Map operations and fleet/vessel/voyage endpoints.

#### [NEW] [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/partners/services/api.ts)
- Map partner profile and management endpoints.

#### [NEW] [api.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/commercial/services/api.ts)
- Map pricing, quotes, and promo endpoints.

---

### Auth Services & Types

#### [NEW] [types/index.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/auth/types/index.ts)
- Implement strongly typed `AuthUser` interface on the frontend.

#### [MODIFY] [services/index.ts](file:///home/bkg/blue-pineapple/apps/web/src/features/auth/services/index.ts)
- Implement `requestOtp()`, `verifyOtp()`, `refreshSession()`, `logout()`, `getCurrentUser()`.
- Ensure they delegate to `apiClient` / `fetcher` and write tokens to client cookies.

---

### Session Context & Providers

#### [NEW] [session-provider.tsx](file:///home/bkg/blue-pineapple/apps/web/src/providers/session-provider.tsx)
- Implement `SessionProvider`, `SessionContext`, and `useSession()`.
- Store `AuthUser`, JWT expiry (`expiresAt`), loading, and authenticated states.
- Expose `refresh()`, `logout()`, and `updateUser()`.

#### [DELETE] [auth-provider.tsx](file:///home/bkg/blue-pineapple/apps/web/src/providers/auth-provider.tsx)
- Remove in favor of the new unified `SessionProvider`.

#### [MODIFY] [app-providers.tsx](file:///home/bkg/blue-pineapple/apps/web/src/providers/app-providers.tsx)
- Swap `AuthProvider` for `SessionProvider`.

#### [MODIFY] [index.ts](file:///home/bkg/blue-pineapple/apps/web/src/providers/index.ts)
- Re-export `SessionProvider` and `useSession` instead of `AuthProvider`.

---

### Server Session Helpers

#### [MODIFY] [index.ts](file:///home/bkg/blue-pineapple/apps/web/src/lib/auth/index.ts)
- Implement:
  - `getServerSession()` (uses `apiServer` + JWT header from cookies)
  - `requireAuth()` (redirects if not authenticated)
  - `requireRole(role)` (throws `AuthorizationError` if missing role)
  - `requirePermission(permission)` (throws `AuthorizationError` if missing permission)

---

### Query Keys

#### [NEW] [query-keys.ts](file:///home/bkg/blue-pineapple/apps/web/src/lib/query-keys.ts)
- Define a dictionary constant containing caching keys (e.g. `auth.currentUser`, `experiences.list`, `departures.list`, etc.).

---

### UI Loading Helpers & Empty States

#### [NEW] [loading components](file:///home/bkg/blue-pineapple/apps/web/src/components/loading/)
- Implement `LoadingSpinner`, `LoadingOverlay`, `SkeletonCard`, `SkeletonTable`, `SkeletonHero`.

#### [NEW] [empty components](file:///home/bkg/blue-pineapple/apps/web/src/components/empty/)
- Implement `EmptyBookings`, `EmptySearch`, `EmptyDashboard`, `EmptyTrips`.

#### [NEW] [index.ts](file:///home/bkg/blue-pineapple/apps/web/src/components/loading/index.ts) & [index.ts](file:///home/bkg/blue-pineapple/apps/web/src/components/empty/index.ts)
- Barrel-export all respective components.

---

### Documentation

#### [NEW] [application-layer.md](file:///home/bkg/blue-pineapple/docs/frontend/application-layer.md)
- Detail architecture, auth flow, life cycle, provider hierarchy, boundaries, folder structure, and import rules.

---

## Verification Plan

### Automated Verifications
- Run `pnpm lint` to verify zero styling or format errors.
- Run `pnpm typecheck` to verify complete type safety.
- Run `pnpm build` to ensure successful bundle compilation under Next.js 16 and React 19.

### Manual Verification
- Inspect output artifacts and compiled javascript files.
