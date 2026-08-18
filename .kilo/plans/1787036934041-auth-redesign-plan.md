# Partner/Admin Authentication Flow Audit & Redesign

## Current State Analysis

### Observed Flow (Admin Login)
1. Admin visits `/sign-in` (general sign-in page)
2. Clerk authenticates successfully
3. Server-side `getServerSession()` runs in `SignInPage`:
   - Calls DB to resolve user + roles
   - If user found with ADMIN role → redirects to `/admin` ✓
   - **If `getServerSession()` returns null or throws** → server-side redirect is skipped
4. Clerk's `fallbackRedirectUrl="/partner"` fires → redirects to `/partner`
5. Partner layout checks roles → no PARTNER role → redirects to `/unauthorized`
6. User manually clicks "Sign in as Admin" → `/login` → finally reaches `/admin`

### Root Causes

| Bottleneck | Impact | Location |
|---|---|---|
| **`fallbackRedirectUrl` hardcoded to `/partner`** | Admins sent to wrong portal when server redirect fails | `apps/web/src/app/sign-in/[[...rest]]/page.tsx:36` |
| **No role claims in Clerk session** | Every route guard requires a DB hit; middleware cannot route without DB | `middleware.ts` uses `auth.protect()` only |
| **`getServerSession()` has write side effects** | Session resolution auto-provisions PARTNER role/profile; read operation mutates state | `apps/web/src/lib/auth/index.ts:46-112` |
| **N+1 queries on first login** | 6+ DB operations + 1 Clerk API call (~300-500ms) on every new user login | `getServerSession()` + `handleUserCreated()` webhook |
| **Multiple redirect mechanisms racing** | Server-side redirect vs Clerk `fallbackRedirectUrl` vs layout-level role checks can conflict | Sign-in pages + layouts |
| **`React.cache` reliability** | Deduplication across layout/page boundaries is inconsistent in Next.js RSC | `getServerSession()` wrapper |
| **Permissions are dead code** | `permissions: []` hardcoded; `requirePermission()` always throws | `apps/web/src/lib/auth/index.ts:32` |

### Current Auth Touchpoints
- **Middleware**: `clerkMiddleware` with `auth.protect()` — only checks authentication, not roles
- **Layouts**: `partner/(dashboard)/layout.tsx`, `admin/layout.tsx` — role gates happen here
- **Sign-in pages**: 3 separate pages (`/sign-in`, `/login`, `/partner/login`) — each calls `getServerSession()` + `auth()`
- **Webhook**: `api/webhooks/clerk/[[...path]]/route.ts` — handles provisioning but races with inline provisioning
- **API helpers**: `lib/api/partner-helpers.ts`, `lib/api/admin-helpers.ts` — call `getServerSession()`

## Proposed Architecture: Clerk-Centric with DB as Source of Truth

### Core Principles
1. **Clert holds role claims for routing**: Store roles in Clerk `publicMetadata` so middleware and sign-in pages can route without DB hits
2. **Session resolution is pure**: `getServerSession()` reads only; no provisioning side effects
3. **Webhook-only provisioning**: All user creation, role assignment, and partner profile creation happens exclusively in webhooks
4. **Single redirect authority**: One mechanism decides where to send the user after auth; eliminate races
5. **DB is source of truth for authorization**: All protected routes still verify roles against DB (defense in depth)

### Target State

```
┌─────────────────────────────────────────────────────────────┐
│  Clerk (Identity + Authorization Layer)                     │
│  - Session token contains role claims from publicMetadata    │
│  - Middleware routes based on Clerk claims                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js Middleware                                          │
│  - Reads role claims from Clerk session                      │
│  - Routes /admin/* → ADMIN/SUPER_ADMIN only                 │
│  - Routes /partner/* → PARTNER only                         │
│  - No DB hits                                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Server Components / API Routes                              │
│  - getServerSession() reads Clerk session + DB user          │
│  - No provisioning side effects                              │
│  - Layouts do defense-in-depth role checks against DB        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Webhook Handler                                             │
│  - user.created: create DB record, assign roles, create      │
│    partner profile, sync roles to Clerk publicMetadata       │
│  - user.updated: sync role changes to Clerk metadata         │
│  - user.deleted: soft-delete in DB                           │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Eliminate Redirect Race (Immediate Fix)
**Goal**: Stop admins from being sent to `/partner` when they authenticate.

1. **Fix general sign-in fallback**
   - Change `/sign-in` `fallbackRedirectUrl` from `"/partner"` to a dynamic or neutral value
   - Add server-side redirect logic that runs BEFORE Clerk's fallback can fire
   - Consider removing `fallbackRedirectUrl` entirely and handling all redirects server-side

2. **Unify sign-in entry points**
   - Deprecate `/login` and `/partner/login` in favor of a single `/sign-in` with role-based redirect
   - Or, if separate pages are required for UX, ensure each page's `fallbackRedirectUrl` matches its target audience

### Phase 2: Clerk Metadata Sync (Enables Fast Routing)
**Goal**: Make roles available in Clerk so middleware can route without DB queries.

1. **Add role sync to webhook**
   - In `handleUserCreated` and `handleUserUpdated`, after determining roles from DB, write them to Clerk user's `publicMetadata.roles` array
   - Example: `clerkClient.users.updateUser(clerkUserId, { publicMetadata: { roles: ['PARTNER'] } })`

2. **Create migration script**
   - For all existing DB users, sync their roles to Clerk `publicMetadata`
   - Handle users who may not have Clerk accounts (pre-Clerk migration)

3. **Add role metadata to new user provisioning**
   - When `getServerSession()` auto-links a Clerk user, ensure the role sync happens immediately

### Phase 3: Make `getServerSession()` Pure (Eliminate Side Effects)
**Goal**: Session resolution should never write to the database.

1. **Extract provisioning from `getServerSession()`**
   - Remove all `ensurePartnerRole`, `ensurePartnerProfile`, `generatePartnerCode` calls from `auth/index.ts`
   - `getServerSession()` becomes a pure read: `auth() → findByClerkUserId → flattenUser`
   - If user not found → return `{ user: null, expiresAt: null }`

2. **Move all provisioning to webhook exclusively**
   - Webhook `user.created` handles: create DB user, assign PARTNER role, create partner profile, sync roles to Clerk metadata
   - Webhook `user.updated` handles: role changes, profile updates
   - Remove the auto-linking/provisioning fallback in `getServerSession()`

3. **Handle the "first login before webhook" edge case**
   - If `getServerSession()` finds no DB user, log the event and return null
   - The webhook will create the user shortly after (Clerk fires `user.created` on sign-up)
   - For the brief window where the user is authenticated in Clerk but not in DB, show a "setting up your account" page instead of auto-provisioning

### Phase 4: Role-Aware Middleware (Fast Routing)
**Goal**: Route users to the correct portal without DB hits.

1. **Update middleware to check Clerk role claims**
   ```ts
   export default clerkMiddleware(async (auth, request) => {
     if (isProtectedRoute(request)) {
       const session = await auth();
       const roles = session.publicMetadata?.roles as string[] || [];
       
       if (request.nextUrl.pathname.startsWith('/admin')) {
         if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
           return NextResponse.redirect(new URL('/unauthorized', request.url));
         }
       }
       
       if (request.nextUrl.pathname.startsWith('/partner')) {
         if (!roles.includes('PARTNER')) {
           return NextResponse.redirect(new URL('/unauthorized', request.url));
         }
       }
     }
     return NextResponse.next();
   });
   ```

2. **Keep layout-level role checks as defense in depth**
   - Layouts still call `getServerSession()` and verify against DB
   - This catches cases where Clerk metadata is stale or tampered

### Phase 5: Simplify Sign-In Redirects
**Goal**: Eliminate the race between server-side redirect and Clerk fallback.

1. **Single redirect authority**
   - Remove all `fallbackRedirectUrl` props from Clerk `<SignIn>` components
   - Handle ALL post-auth redirects server-side in the sign-in page component
   - Use Clerk session claims for instant redirect, with DB verification as fallback

2. **Consolidate sign-in pages**
   - Merge `/login` and `/partner/login` into `/sign-in` with role-aware redirect
   - Use Clerk's `signInUrl` parameter to direct users to the appropriate page based on their context

### Phase 6: Validation & Observability
**Goal**: Ensure the new flow is reliable and debuggable.

1. **Add auth flow logging**
   - Log every `getServerSession()` call with timing
   - Log provisioning events in webhook
   - Log redirect decisions in middleware and layouts

2. **Add health checks**
   - `/api/auth/health` endpoint that verifies DB connectivity, Clerk connectivity, and role sync status

3. **Add metrics**
   - Track: login latency, provisioning time, redirect accuracy, role sync lag

## Migration Path

### For Existing Users
1. Run migration script to sync all existing DB roles to Clerk `publicMetadata`
2. Deploy middleware update
3. Deploy pure `getServerSession()` update
4. Monitor for users whose Clerk metadata is stale (they'll hit layout-level redirects until metadata syncs)

### For New Users
1. Webhook provisions user + syncs roles to Clerk metadata
2. User authenticates via Clerk
3. Middleware reads Clerk claims → routes correctly
4. `getServerSession()` verifies against DB (defense in depth)

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Clerk metadata gets out of sync with DB | Webhook `user.updated` re-syncs on every change; periodic reconciliation job |
| Migration fails for users without Clerk accounts | Graceful fallback: if no Clerk account, skip metadata sync; user goes through normal provisioning |
| Middleware latency increases with metadata reads | Clerk metadata is in the session token; no additional API calls needed |
| Breaking change for existing sessions | Use `dynamic = 'force-dynamic'` on auth pages during transition; invalidate sessions gracefully |

## Open Questions

1. **Should we use Clerk Organizations instead of custom roles?** Clerk has built-in org/role features that could replace our custom DB roles entirely. This would be a larger migration but more "enterprise-grade."
2. **What is the acceptable role sync latency?** If webhook-based sync is too slow for the "first login" experience, we may need to accept a brief provisioning delay or show a loading state.
3. **Should we keep separate `/login` and `/partner/login` pages for UX, or unify them?** Separate pages provide clearer branding but duplicate redirect logic. Unified page is simpler but less customizable.

## Validation Plan

1. **Unit tests**: Test `getServerSession()` returns null for unknown users without side effects
2. **Integration tests**: Test full login flow for admin, partner, and new user
3. **E2E tests**: Verify redirects work correctly for each role
4. **Load tests**: Verify middleware routing adds no measurable latency
5. **Canary**: Roll out to 10% of users, monitor auth success rate and redirect accuracy

## Effort Estimate (Indicative)

- Phase 1 (Immediate fix): 1-2 days
- Phase 2 (Clerk metadata sync): 2-3 days
- Phase 3 (Pure session): 2-3 days
- Phase 4 (Role-aware middleware): 1 day
- Phase 5 (Simplify redirects): 1-2 days
- Phase 6 (Validation): 2-3 days

**Total**: ~10-15 days for full implementation
