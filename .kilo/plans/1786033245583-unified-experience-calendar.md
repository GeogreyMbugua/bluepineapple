# Unified Experience Calendar & Booking UX Overhaul

## Business Context

### Fleet & Domain Model
- **Setting Sons** — CATAMARAN_LUXURY, capacity 35. Used exclusively for **Fort Jesus Historical Boat Tour** (water taxi / hop-on-hop-off). This is the revenue-driving experience.
- **Hunky Dory** — SPEEDBOAT, capacity 14, glass-bottom. Used for **Creek Safaris**, **Sunset Sailing**, **Snorkelling Reef**, and **Birthdays & Anniversaries**.

### Experience Categories
| slug | name | category | vessel | duration | defaultPrice |
|------|------|----------|--------|----------|--------------|
| fort-jesus | Fort Jesus Historical Boat Tour | TRANSPORT | Setting Sons | 8h | 500 |
| creek-safaris-mangrove | Creek Safaris & Mangrove Exploration | ADVENTURE | Hunky Dory | 3h | 4000 |
| sunset-sailing | Sunset Sailing | LEISURE | Hunky Dory | 2.5h | 3000 |
| snorkelling-reef | Snorkelling Reef Experience | ADVENTURE | Hunky Dory | 2h | 2000 |
| birthdays-anniversaries | Birthdays & Anniversaries | PRIVATE | Hunky Dory | 2h | 2000 |

### Current Booking Flows
1. **Partner bookings** (`/api/partner/bookings`)
   - Partner books on behalf of guests
   - No guest email required
   - Rewards engine applies partner rewards (no public discounts)
   - `source: PARTNER`
   
2. **Direct/public bookings** (`/api/bookings`)
   - Guest self-books via marketing page
   - Guest email/phone collected
   - Pricing engine applies discounts (10% couples, 20% groups, 50% children, free under-5)
   - `source: DIRECT`
   - Admin confirms booking → confirmation email sent

3. **Admin bookings** (`/api/admin/bookings`)
   - Admin creates bookings manually
   - `source: ADMIN`

### Notification Architecture
- `booking.created` → admin notification to all users with `ADMIN` or `SUPER_ADMIN` roles (DB-backed, no env var)
- `booking.confirmed` → guest/partner confirmation email via Resend
- Engine initialized in `iam-init.ts` and called per-request in API routes

## Problems to Solve

1. **Calendar is water-taxi only** — Admin operations page and partner calendar API are hardcoded to `fort-jesus`. Other experiences cannot be scheduled or viewed in calendar.
2. **No unified calendar UI** — The existing `WaterTaxiSchedule` is a custom `react-day-picker` implementation, not a modern resource/time-grid calendar.
3. **Fort Jesus marketing page is cluttered** — 5+ CTAs, the only action that matters is "Book appointment".
4. **Public booking notifications** — Need to confirm bookings via email/WhatsApp. WhatsApp is preferred locally but no Meta API is configured.

## Proposed Implementation

### Phase 1: Unified Calendar Component (Admin + Partner)

**Goal**: Replace the custom day-picker with `@reui/event-calendar` for a modern, resource-aware calendar that works for all experiences and both vessels.

**Data shape for the calendar engine**:
```ts
type CalendarEvent = {
  id: string;
  title: string; // "Fort Jesus — 09:30" or "Sunset Sailing — 17:00"
  start: Date;
  end: Date;
  resourceId: string; // vessel slug or experience slug
  resourceLabel: string; // "Setting Sons" or "Hunky Dory"
  status: DepartureStatus;
  availableCapacity: number;
  totalCapacity: number;
  bookedSeats: number;
  bookingCount: number;
  route?: string;
  stops?: Array<{ name: string; code: string }>;
  experienceCategory?: string;
};
```

**Views to support**:
- **Month / Week / Day** — standard date views
- **Resource Time Grid** — horizontal scroll per vessel (Setting Sons row, Hunky Dory row). This is the critical view for operations.
- **Agenda** — simple list

**Color coding**:
- SCHEDULED → blue
- BOARDING → amber
- DEPARTED → green
- CANCELLED → red
- Fully booked (availableCapacity === 0) → striped/dimmed

**Resources (vessels)**:
- `setting-sons` — Setting Sons (capacity 35)
- `hunky-dory` — Hunky Dory (capacity 14)

**Blocked dates** → shown as all-day blocked bars in the resource grid.

**API changes**:
- Generalize `/api/partner/trips/calendar` to accept `experienceSlug` query param (default `fort-jesus`)
- Generalize `getAdminTripCalendar` to accept `experienceSlug` (already does, but hardcoded in some places)
- Add a new public calendar API `/api/public/calendar` for the marketing page (read-only, no auth)

### Phase 2: Marketing Page Calendar Integration

**Goal**: Show availability directly on the Fort Jesus trip page so users can pick a date and departure without leaving the page.

**UX flow**:
1. User lands on `/trips/fort-jesus-trip`
2. Hero has one primary CTA: **"Check availability & book"**
3. Below the fold, a **calendar strip** shows the next 14 days with dots for available departures
4. Clicking a day opens a **day panel** with departure times, seats left, and a **quick-book** form
5. Reduces friction: no separate `/book` page needed for simple bookings

**Fort Jesus page cleanup**:
- Remove duplicate CTAs (`Reserve spot`, `View route & fares`, `Book Now`, `Ask a Question`, `Reserve your journey`)
- Keep one sticky/fixed bottom bar on mobile: **"Book Now — from Ksh 500"**
- Keep one inline CTA in hero: **"See availability"** (scrolls to calendar)
- Move route/fares, itinerary, FAQ below the calendar
- WhatsApp link stays in footer/contact section only

### Phase 3: Public Booking Notification Options

**Current**: Email confirmation via Resend (works for `bluepineappleholdings.com` domain).

**WhatsApp options** (no Meta API configured):
1. **Twilio WhatsApp API** — easiest to add. Use Twilio's WhatsApp sandbox or production API. Send template messages for booking confirmations. Cost: ~KES 1-2 per message.
2. **WhatsApp Business API via 360dialog / Wati / respond.io** — more features (buttons, lists), but requires onboarding.
3. **Manual fallback** — keep the WhatsApp number visible and ask users to screenshot their booking reference. Not ideal.

**Recommendation**: Add **Twilio WhatsApp** as a parallel channel. Since we already have email working, we can:
- Send email confirmation to all guests who provide email
- Send WhatsApp confirmation to all guests who provide phone number
- For guests without email, WhatsApp becomes the primary channel
- Use Twilio's templated messages (pre-approved by Meta) for booking confirmations

**Schema change needed**: `Guest.phone` is already optional. We should make it effectively required for direct bookings (or at least strongly encouraged).

### Files to Create/Modify

**New files**:
- `packages/iam/src/adapters/twilio.adapter.ts` — WhatsApp notification adapter
- `packages/iam/src/notifications/templates/booking-confirmation-whatsapp.ts` — WhatsApp message template
- `apps/web/src/components/calendar/experience-calendar.tsx` — unified calendar component
- `apps/web/src/components/calendar/availability-strip.tsx` — marketing page calendar strip
- `apps/web/src/app/api/public/calendar/route.ts` — public calendar API

**Modified files**:
- `packages/iam/src/notifications/booking-notification-engine.ts` — add WhatsApp fallback
- `packages/iam/src/adapters/index.ts` — export Twilio adapter
- `apps/web/src/app/(marketing)/trips/fort-jesus-trip/page.tsx` — cleanup CTAs, add calendar
- `apps/web/src/app/api/partner/trips/calendar/route.ts` — accept experienceSlug param
- `apps/web/src/lib/services/admin-dashboard.service.ts` — already supports experienceSlug, ensure consistency
- `apps/web/src/app/admin/operations/page.tsx` — replace WaterTaxiSchedule with ExperienceCalendar

## Implementation Order

1. **Generalize partner calendar API** to accept `experienceSlug` (30 min)
2. **Build unified `ExperienceCalendar` component** using `@reui/event-calendar` with resource time grid for vessels (2-3 hrs)
3. **Replace admin WaterTaxiSchedule** with `ExperienceCalendar` (30 min)
4. **Add public calendar API** `/api/public/calendar` (30 min)
5. **Refactor Fort Jesus marketing page** — single CTA, embed calendar strip (1-2 hrs)
6. **Add Twilio WhatsApp adapter** (optional, 1-2 hrs)
7. **Tests** for calendar data transformations and engine handler (1 hr)

## Risks & Mitigations

- **`@reui/event-calendar` may not be installed or compatible**: Verify package exists and fits the Next.js app router. If not, fallback to `@fullcalendar/react` or `react-big-calendar`.
- **Performance with many departures**: Use pagination/date-range filters on API. The calendar only needs ±30 days.
- **Blocked dates vs voyage dates**: Current calendar conflates departures and voyages. Unified calendar should treat voyages as special departure events with different visuals.
- **WhatsApp template approval**: Meta requires pre-approved templates. Twilio sandbox can speed this up but still takes 1-2 days.
