# Operations Admin Redesign — Plan

## Goal

Transform `/admin/operations` from a static single-experience (Fort Jesus — "Setting Sons") dashboard into a multi-experience operations hub that supports Water Taxi now and other experiences (private charter, birthdays, creek safaris) later. The Voyage entity (already defined in the Prisma schema + IAM services) tracks operational lifecycle beyond scheduled departures.

## Current State

- **Operations page** (`/admin/operations/page.tsx`): 152 lines. Hardcoded to `getAdminTripCalendar('fort-jesus', today, today)`. Shows KPI cards, a departures table, and upcoming blocked dates. No voyage or crew management UI.
- **Voyage service** (`packages/iam/src/operations/operations.service.ts`): 604 lines. Fully implemented in IAM package with full state machine, ready for API exposure.
- **Operations API client** (`apps/web/src/features/operations/services/api.ts`): Stub with placeholder types (`Voyage` has `title`, `startDate`, `endDate`, `status: draft/active/completed/cancelled` — does not match DB schema's `PLANNED/READY/BOARDING/DEPARTED/ARRIVED/COMPLETED/CANCELLED/ABORTED`).
- **Feature modules** (`apps/web/src/features/operations/{hooks,schemas,components,types}/`): All barrel-only (`export {};`).
- **No API routes** exist for `/operations/voyages`, `/operations/crew`, or `/operations/{id}/manifest`.
- **Voyage entity** mirrors `Departure` 1:1 but adds captain, crew assignments, readiness checks, incidents, timeline, and passenger manifest (check-in/boarding status).

## Key Definitions

| Term | Meaning in this codebase |
|------|--------------------------|
| **Experience** | Product catalog item with a category (`TRANSPORT`, `LEISURE`, `ADVENTURE`, `PRIVATE`, `CORPORATE`). E.g., "Fort Jesus" = TRANSPORT, "Setting Sons Charter" = PRIVATE. |
| **Departure** | A scheduled time-slot for an experience (has `departureDateTime`, `arrivalDateTime`, `vesselId`, `routeId`, `experienceId`, capacity, and `DepartureStatus`: SCHEDULED/BOARDING/DEPARTED/COMPLETED/CANCELLED). |
| **Vessel** | Physical boat (FERRY/SPEEDBOAT/DHOW/CATAMARAN/CATAMARAN_LUXURY) with capacity and `VesselStatus`: ACTIVE/INACTIVE/MAINTENANCE/DECOMMISSIONED. |
| **Voyage** | Operational tracking entity for a departure (1:1 with Departure). Has its own status lifecycle (`PLANNED → READY → BOARDING → DEPARTED → ARRIVED → COMPLETED`, with `CANCELLED` and `ABORTED` escape states). Tracks captain, crew, readiness checks, incidents, timeline, and passenger manifest. |
| **Manifest** | Links Booking → Voyage → Guest with operational status (`RESERVED → CHECKED_IN → BOARDED → ON_VOYAGE → COMPLETED`, `NO_SHOW`, `CANCELLED`). Each entry has CheckIn and Boarding sub-records. |

## Design Decisions (Resolved)

1. **Operations = Voyage lifecycle management + departure scheduling + vessel/crew management + blocked dates + incidents**
2. **Experience selection** — Admin can switch between experiences. Current default: Fort Jesus (`fort-jesus` slug). Future: private charter, birthdays, etc.
3. **Experience → Departure → Voyage** is the data chain. A departure is scheduled in the booking system; a voyage is the operational overlay created when ready to operate.
4. **Operations page scope** = departures + voyages for the selected experience + vessel/crew context. NOT crew management (separate admin section).
5. **Voyage creation** — Manual trigger: admin creates a Voyage from a Departure when ready to operate. Until then, the Departure exists in SCHEDULED state without a Voyage.
6. **Admin API client stubs must be updated** to match the DB schema (use real voyage statuses, voyage number, manifest counts, etc.)
7. **API routes must be created** — The IAM services are ready but no Next.js API routes expose them.

## Implementation Tasks

### 1. API Routes (backend)

**1a. `/api/admin/operations/voyages/route.ts`**
- `GET` — List voyages with optional filters: `experienceSlug`, `status`, `vesselId`, `from`, `to`, `limit`
- `POST` — Create a voyage from a departure (requires `departureId`, `vesselId`, `routeId`, optional `captainId`, `operationalNotes`) Uses `voyageService.createVoyage()`

**1b. `/api/admin/operations/voyages/[id]/route.ts`**
- `GET` — Get voyage details with crew assignments, manifest, readiness checks, incidents, timeline Uses `voyageRepository.findById()` (already has full detail loader)
- `PATCH` — Update voyage (operational notes, weather summary, actual times, captain) Uses `voyageService` or direct repository update

**1c. `/api/admin/operations/voyages/[id]/status/route.ts`**
- `POST` — Transition voyage status (READY, BOARDING, DEPARTED, ARRIVED, COMPLETED, CANCELLED, ABORTED) Uses `OperationsPolicy.assertTransition()` + specific service methods (`startBoarding()`, `departVoyage()`, `arriveVoyage()`, `completeVoyage()`, `cancelVoyage()`, `abortVoyage()`)

**1d. `/api/admin/operations/voyages/[id]/crew/route.ts`**
- `POST` — Assign crew member to voyage
- `DELETE` — Remove crew member from voyage
- `GET` — List crew assignments for voyage
Uses `voyageService.assignCrew()` / `removeCrew()`

**1e. `/api/admin/operations/voyages/[id]/manifest/route.ts`**
- `POST` — Generate manifest from confirmed bookings
- `GET` — List manifest entries with guest + booking details
Uses `voyageService.generateManifest()` / `manifestRepository.findByVoyage()`

**1f. `/api/admin/operations/voyages/[id]/manifest/[manifestId]/checkin/route.ts`**
- `POST` — Check in passenger (RESERVED → CHECKED_IN)
- `DELETE` — Undo check-in

**1g. `/api/admin/operations/voyages/[id]/manifest/[manifestId]/boarding/route.ts`**
- `POST` — Board passenger (CHECKED_IN → BOARDED)
- `DELETE` — Undo boarding (BOARDED → CHECKED_IN)

**1h. `/api/admin/operations/crew/route.ts`**
- `GET` — List all active crew members (for assignment)
- `POST` — Create crew member
Uses `crewService.listActiveByRole()` / `createCrewMember()`

**1i. `/api/admin/operations/incidents/route.ts`**
- `GET` — List incidents (optionally filtered by voyageId, severity)
- `POST` — Report incident
Uses `incidentService.reportIncident()` / `findBySeverity()`

### 2. Admin Service Layer (frontend)

**2a. Update `apps/web/src/lib/services/admin-dashboard.service.ts`**
- Rename `getAdminTripCalendar` → `getAdminOperationsDashboard(experienceSlug, startStr, endStr)`
- Add `getVoyageCalendar(experienceSlug, startStr, endStr)` — same data but also includes voyage status, voyage number, captain, crew count, manifest readiness state
- Add `getActiveVoyages(experienceSlug)` — current in-progress voyages for KPI card
- Add `getVesselFleet(experienceSlug)` — vessels used by this experience with status

**2b. Create `apps/web/src/lib/services/operations.service.ts`**
- `getVoyageDetail(voyageId)` — uses voyageRepository.findById
- `updateVoyageStatus(voyageId, status, actorId)` — wraps OperationsPolicy + service
- `generateManifest(voyageId, actorId)` — wraps voyageService.generateManifest
- `assignCrew(voyageId, crewMemberId, role, actorId)`
- `removeCrew(voyageId, crewMemberId, actorId)`
- `checkInPassenger(manifestId, boardingGroup, actorId)`
- `boardPassenger(manifestId, status, actorId)`
- `reportIncident(voyageId, type, severity, description, actorId)`

### 3. Frontend Feature Module Updates

**3a. Update `apps/web/src/features/operations/services/api.ts`**
- Replace placeholder types with correct types matching DB schema
- Update endpoints to match new API routes:
  - `operationsApi.voyages.list(params)` → `/admin/operations/voyages`
  - `operationsApi.voyages.detail(id)` → `/admin/operations/voyages/{id}`
  - `operationsApi.voyages.updateStatus(id, status, ...)` → `/admin/operations/voyages/{id}/status`
  - `operationsApi.voyages.assignCrew(id, data)` → `/admin/operations/voyages/{id}/crew`
  - `operationsApi.voyages.generateManifest(id)` → `/admin/operations/voyages/{id}/manifest`
  - `operationsApi.manifest.checkIn(manifestId, data)` → `/admin/operations/voyages/{voyageId}/manifest/{manifestId}/checkin`
  - `operationsApi.manifest.boarding(manifestId, data)` → `/admin/operations/voyages/{voyageId}/manifest/{manifestId}/boarding`
  - `operationsApi.crew.list()` → `/admin/operations/crew`
  - `operationsApi.incidents.list(voyageId)` → `/admin/operations/incidents`
  - `operationsApi.incidents.report(data)` → POST to same

**3b. Populate `apps/web/src/features/operations/types/index.ts`**
- `Voyage` with correct fields: `voyageNumber`, `status` (PLANNED | READY | BOARDING | DEPARTED | ARRIVED | COMPLETED | CANCELLED | ABORTED), `scheduledDeparture`, `actualDeparture`, `actualArrival`, `captain`, `crewAssignments`, `manifest`, `readinessChecks`, `incidents`, `timeline`
- `ManifestEntry` with guest + booking + checkIn + boarding
- `CrewMember` for assignment dropdown
- `Incident` for incident reporting

**3c. Populate `apps/web/src/features/operations/schemas/index.ts`**
- Zod schemas for voyage status transitions, crew assignment, manifest check-in, boarding, incident reporting

**3d. Populate `apps/web/src/features/operations/hooks/`**
- `useVoyages(experienceSlug, filters)` — async data fetch with SWR/revalidation
- `useVoyage(voyageId)` — single voyage detail
- `useVoyageActions()` — mutation hooks (status transitions, crew, manifest, incidents)

### 4. Admin UI Components

**4a. Update `admin/operations/page.tsx`**
- Add experience selector dropdown (fetch active experiences from `/api/admin/experiences`)
- KPI cards: Today's Bookings, Active Voyages, Total Capacity, Upcoming Blocks (update "Active Departures" → "Active Voyages")
- Calendar view (reuse `<WaterTaxiSchedule>` but extend to show voyage status, not just departure status)
- Voyage quick-actions panel (create voyage from departure, transition status)
- Quick links to crew management, blocked dates, bookings

**4b. Create `admin/operations/[voyageId]/page.tsx`** (Voyage Detail)
- Voyage header: voyage number, status badge, scheduled/actual departure times
- Captain assignment panel
- Crew assignment panel (assign/remove crew from dropdown)
- Readiness checklist (6 checkboxes: CREW_ASSIGNED, MAINTENANCE_COMPLETE, etc.)
- Passenger manifest table (check-in, board, undo actions per passenger)
- Incidents section (report incident form, incident list)
- Voyage timeline (event log)
- Status transition buttons (contextual based on current status)

**4c. Create `admin/operations/crew/page.tsx`** (Crew Management)
- Crew member list table (name, role, license, active status, assignments)
- Create/edit crew member form
- Assign crew to voyage

### 5. Calendar Component Enhancement

The existing `<WaterTaxiSchedule>` (now using `react-day-picker`) should be adapted:
- Accept `experienceSlug` as a prop
- Show voyage status alongside departure status (if a voyage exists)
- Color code: green dot = voyage exists & ready, yellow = departure scheduled but no voyage, red = blocked

## Data Flow

```
Admin UI (client component)
  → useVoyages() hook
    → fetch /api/admin/operations/voyages?experience=fort-jesus&date=today
      → voyageService.listVoyages() / getAdminOperationsDashboard()
        → voyageRepository.findUpcoming() + departureRepository + blockedDates
          → Prisma (single connection via singleton)

Admin clicks "Create Voyage" on a departure
  → POST /api/admin/operations/voyages
    → voyageService.createVoyage()
      → OperationsPolicy + voyageRepository.create()
      → emit voyage.created event
```

## Out of Scope (Phase 2)

- Full crew management UI (admin/operations/crew) — API routes + service layer are ready, but the UI page is deferred
- Incident reporting UI — service layer ready, UI deferred
- Recurring blocked date expansion logic (the `isRecurring` flag exists but no logic expands it)
- Vessel maintenance logs management
- Operations dashboard analytics (hourly booking trends, manifest analytics)
- Multi-experience support in the calendar (will come after Phase 1 establishes the single-experience pattern with a selector)

## Migration Notes

- The operations page currently calls `getAdminTripCalendar('fort-jesus')` — this will be replaced by `getVoyageCalendar('fort-jesus')` which adds voyage fields to the existing daily summary data
- The `WaterTaxiSchedule` component types need `voyageStatus?: string` and `voyageId?: string` added to `Departure`
- No database migrations needed — all Voyage, Crew, Manifest, Incident, ReadinessCheck, Timeline, CheckIn, Boarding tables already exist in the schema

## Validation

1. `npx turbo run typecheck` — all packages must pass
2. `npx turbo run lint` — all packages must pass
3. API routes must return correct shapes matching frontend types
4. `OperationsPolicy` transition rules must be enforced (can't cancel a COMPLETED voyage, can't board without readiness checks, etc.)
5. Existing `getAdminTripCalendar` callers (dashboard) must continue working after any service rename
