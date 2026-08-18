# Partner Booking 404, Pricing Audit, and Event Calendar Optimization

## Findings

### 1. Partner Booking 404 on Create
**File:** `apps/web/src/components/partner/bookings-page-header.tsx:33`
**Root cause:** `window.location.href = '/partner/(dashboard)/bookings?refresh=1'` performs a hard browser navigation. The `(dashboard)` segment is a Next.js route group; hard navigation bypasses the Next.js router and the server cannot resolve the path, producing a 404.
**Impact:** Every partner booking creation triggers a full-page 404 before the user can recover.

### 2. Pricing Computation Mismatch
**Frontend:** `apps/web/src/components/partner/partner-booking-form.tsx` calls `calculatePricing()` from `lib/pricing/engine`. This is a sophisticated stop-based calculator:
- Uses `ONE_WAY_FARES`/`RETURN_FARES` tables by stop count (1–8 stops, 500–5000 KES)
- Applies child discount (50%)
- Applies couple discount (10%) and group discount (20%)
- Shows origin → destination, stop count, per-guest fare, and total

**Backend:** `apps/web/src/app/api/partner/bookings/route.ts:96-124`
- Hardcodes experience to `slug: 'fort-jesus'`
- Ignores the client-provided pricing entirely
- Falls back to `experience.defaultPrice * totalGuests` when `totalAmount` is missing or zero

**Result:** The price shown to the partner does not match the price stored in the booking. Partners creating bookings through the UI see one total, but the database records a different (often lower) amount.

### 3. Auth Log Foreign Key Constraint
**File:** `packages/iam/src/audit/audit-logger.ts`
**Root cause:** `logAdminAction()` passes `actorId` directly as `userId` in `AuthLog.create()`. Many callers pass `"system"` or `null`:
- `operations.service.ts`: `actorId ?? "system"` (22 occurrences)
- `reward.service.ts`: literal `"system"` (6 occurrences)
- `partner-reward.service.ts`: `actorId ?? "system"`

When `actorId` is `"system"` or a non-existent UUID, Prisma violates `auth_logs_userId_fkey`.
**Production error:** `prisma.authLog.create()` → `Foreign key constraint violated on the constraint: auth_logs_userId_fkey`

### 4. Event Calendar Component
The user shared a `@reui/c-event-calendar-1` component that is **not currently installed**. It provides a richer calendar with:
- Month / week / day / agenda / resource time-grid views
- Drag-to-create, drag-to-move, drag-to-resize
- Multi-language i18n (en, de, fr, es, ja, ar)
- Time zone switching
- Custom event rendering

This could replace the current basic calendar in the admin operations page.

## Execution Plan

### P0 — Production fixes (blocking)

1. **Fix partner booking 404**
   - Replace `window.location.href` in `bookings-page-header.tsx` with `router.push('/partner/(dashboard)/bookings')` using `useRouter` from `next/navigation`.
   - Remove the `?refresh=1` query string entirely; the bookings table is a server component and re-fetches on navigation.

2. **Fix auth log FK constraint**
   - Option A (recommended): Make `actorId` nullable in `AuthLog.userId` and update the Prisma schema + migration.
   - Option B: Guard `logAdminAction` so it only writes when `actorId` is a valid existing user UUID; skip or log to stdout when it is `"system"`.
   - Option B is lower-risk and faster for a hotfix. Option A is cleaner long-term.

### P1 — Pricing alignment

3. **Align backend pricing with frontend calculator**
   - In `api/partner/bookings/route.ts`, replace the `experience.defaultPrice * guests` fallback with the same `calculatePricing()` logic used in the form.
   - Remove the hardcoded `slug: 'fort-jesus'`; derive the experience from the departure or from a selected experience in the form.
   - Pass the selected origin stop to the API so the backend can validate the fare matches what the partner saw.

4. **Expose pricing breakdown in booking response**
   - Return the breakdown (`oneWayAdultFare`, `stopCount`, `discountsApplied`) so the partner confirmation screen can display the same numbers.

### P2 — Event calendar adoption

5. **Install `@reui/c-event-calendar-1`**
   - Run `pnpm dlx shadcn@latest add @reui/c-event-calendar-1`
   - Verify peer dependencies (date-fns, lucide-react, tailwind-variants).

6. **Refine for water-taxi use case**
   - Replace the current basic calendar in `admin/operations/page.tsx` (or the existing `WaterTaxiSchedule` component) with the event calendar.
   - Map departures to calendar events with:
     - Start/end = departure datetime
     - Resource = vessel name or captain
     - Color = status-based (boarding = amber, departed = green, planned = gray)
   - Disable drag/resize/create (operations staff view, not self-service booking).
   - Keep views: month for overview, week for daily schedule, day for detail.

### P3 — Hardening

7. **Audit log consistency**
   - After P0 fix, grep for remaining `"system"` literals in audit calls and decide on a uniform policy.

8. **Type safety in partner booking**
   - `partner-dashboard.service.ts` exports `totalAmount: number` but `PartnerBooking` in the API route maps it as `String(...)`. Standardize to `number` across the chain.

## Open Questions

- Should the partner booking form allow selecting the experience, or should it remain Fort Jesus only?
- For the audit log, do you want `system` events preserved, or is it acceptable to drop them until the schema allows null users?
