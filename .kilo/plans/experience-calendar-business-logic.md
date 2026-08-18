# Unified Experience Calendar — Business Logic Specification

## 1. Purpose

The calendar is the operational and commercial backbone of Blue Pineapple Holdings. It translates scheduled **departures** into visual availability, manages **capacity**, surfaces **bookings**, and supports both **admin operations** and **partner/public booking** workflows.

---

## 2. Core Domain Model

### 2.1 Experiences

Experiences are the sellable products. Each experience defines:
- **Category**: TRANSPORT, ADVENTURE, LEISURE, PRIVATE
- **Vessel assignment**: which vessel type serves this experience
- **Duration**: how long the experience runs
- **Default price**: base fare used for quick estimates
- **Route mapping**: which routes apply to this experience

| slug | name | category | vessel | duration | defaultPrice |
|------|------|----------|--------|----------|--------------|
| fort-jesus | Fort Jesus Historical Boat Tour | TRANSPORT | Setting Sons | 8h | 500 |
| creek-safaris-mangrove | Creek Safaris & Mangrove Exploration | ADVENTURE | Hunky Dory | 3h | 4000 |
| sunset-sailing | Sunset Sailing | LEISURE | Hunky Dory | 2.5h | 3000 |
| snorkelling-reef | Snorkelling Reef Experience | ADVENTURE | Hunky Dory | 2h | 2000 |
| birthdays-anniversaries | Birthdays & Anniversaries | PRIVATE | Hunky Dory | 2h | 2000 |

### 2.2 Fleet

| vessel | type | capacity | serves |
|--------|------|----------|--------|
| Setting Sons | CATAMARAN_LUXURY | 35 | Fort Jesus only |
| Hunky Dory | SPEEDBOAT | 14 | All other experiences |

A vessel can be in one of the following states:
- **ACTIVE** — available for scheduling
- **INACTIVE** — not in service
- **MAINTENANCE** — out of service for repairs
- **DECOMMISSIONED** — permanently retired

### 2.3 Routes & Stops

A route is a sequence of stops. Stops have:
- **Sequence order** on the route
- **Pickup/dropoff flags**
- **Geographic coordinates** (optional)

Fort Jesus route example:
```
Mtwapa Beach → Serena → Bamburi → Whitesands → Pirates →
Mombasa Beach → Nyali → English Point → Fort Jesus
```

### 2.4 Departures

A departure is a **scheduled instance** of an experience. It is the unit the calendar displays.

Key fields:
- `departureDateTime` — when the boat leaves
- `arrivalDateTime` — when it returns/arrives
- `totalCapacity` — fixed per vessel
- `bookedSeats` — sum of `totalGuests` across all non-cancelled bookings
- `availableCapacity` = `totalCapacity` − `bookedSeats`
- `status` — SCHEDULED, BOARDING, DEPARTED, COMPLETED, CANCELLED

**Business rule**: A departure is bookable only when:
- `status` is SCHEDULED or BOARDING
- `availableCapacity` > 0
- The date is not blocked

### 2.5 Blocked Dates

Dates when a vessel is unavailable regardless of scheduled departures. Reasons include:
- Maintenance
- Weather
- Private charters
- Regulatory holds

Blocked dates can be **recurring** (e.g., every Monday) or one-off.

### 2.6 Bookings

A booking ties a guest or partner to a departure.

| field | rule |
|-------|------|
| `source` | PARTNER, DIRECT, ADMIN, HOTEL, CORPORATE |
| `guestId` | nullable — partner bookings may have no guest record |
| `partnerId` | always required |
| `totalGuests` | number of seats consumed |
| `status` | PENDING → CONFIRMED → COMPLETED / CANCELLED / NO_SHOW |
| `paymentStatus` | PENDING / PAID / REFUNDED / PARTIALLY_REFUNDED |

**Capacity enforcement**: When a booking is confirmed, `availableCapacity` decrements and `bookedSeats` increments atomically. When cancelled, they reverse.

### 2.7 Guests & Booking Guests

- **Guest** — a CRM record with optional email/phone. Used for direct bookings.
- **BookingGuest** — per-booking passenger list. Supports additional passengers beyond the primary guest.

### 2.8 Voyages

A voyage is the **operational execution** of a departure. It tracks:
- Captain assignment
- Actual departure/arrival times
- Weather conditions
- Readiness checks
- Crew assignments

Voyages are created from confirmed departures. One departure can have zero or one voyage.

---

## 3. Calendar Data Model

### 3.1 Daily Summary

For each date with activity:

```
date: "2026-08-10"
isBlocked: false
blockedReason?: string
departureCount: 3
totalCapacity: 49          // sum across departures
totalBooked: 18            // sum of bookedSeats
totalBookings: 8           // count of booking records
voyageCount: 1
departures: Departure[]
voyages: Voyage[]
```

### 3.2 Departure Card

```
id, time, experience, route, vessel, vesselType
totalCapacity, bookedSeats, availableCapacity, status
bookingCount, bookings[]
```

### 3.3 Booking Row

```
reference, status, paymentStatus, totalGuests, totalAmount
source, specialRequests, createdAt
guest: { name, email, phone }
partner: { companyName, contact, email }
```

### 3.4 Voyage Card

```
voyageNumber, status, vessel, departureId, readinessPassed
```

---

## 4. User Roles & Calendar Views

### 4.1 Admin

- Sees **all experiences** via a dropdown selector
- Sees **all departures and bookings** across all partners
- Can view passenger manifest for confirmed bookings
- Can see blocked dates and upcoming blocks
- Calendar is **read-only** in operations view; creation/editing happens in dedicated admin booking flows
- Receives `ADMIN_BOOKING_CREATED` notification when any new booking is made

### 4.2 Partner

- Sees **only their own bookings** on the dashboard
- Can fetch calendar data for a selected experience via `/api/partner/trips/calendar`
- Creates bookings on behalf of guests
- No guest email required; partner email used for notifications
- Receives `BOOKING_CONFIRMATION` when admin confirms
- Does **not** receive public discounts; reward engine applies partner rewards instead

### 4.3 Public / Guest

- Views Fort Jesus trip page at `/trips/fort-jesus-trip`
- Can select date and departure from availability strip
- Submits booking with their own contact details
- Receives email confirmation if email provided
- Receives WhatsApp confirmation if phone provided
- Public discounts apply via pricing engine:
  - 10% off couple bookings
  - 20% off group/family bookings (4+ paying passengers)
  - 50% off children 5–15
  - Free under 5

---

## 5. Calendar UI States

### 5.1 Date States

| state | visual indicator |
|-------|-----------------|
| No activity | plain day cell |
| Has departures | blue dot below date |
| Has voyages | green dot below date |
| Blocked | red background, strike-through |
| Today | bold border or ring |
| Selected | filled brand background |

### 5.2 Occupancy States

| occupancy | color |
|-----------|-------|
| < 50% | yellow |
| 50–79% | orange |
| 80–94% | green |
| 95–100% | red |
| 100% (full) | red + "FULL" badge |

### 5.3 Departure Status

| status | color |
|--------|-------|
| SCHEDULED | blue |
| BOARDING | amber |
| DEPARTED | green |
| COMPLETED | green |
| CANCELLED | red |

---

## 6. Notification Rules

### 6.1 Trigger: Booking Created (`booking.created`)

- **Who receives**: All users with role `ADMIN` or `SUPER_ADMIN`
- **Channel**: Email via Resend
- **Content**: Admin booking created template with reference, guest/partner, experience, departure, amount
- **Recipient resolution**: Query `UserRole` + `Role` tables for admin roles; filter by valid email

### 6.2 Trigger: Booking Confirmed (`booking.confirmed`)

- **Primary recipient**: Guest email if present
- **Fallback 1**: Partner user email if guest email absent
- **Fallback 2**: Partner user phone via WhatsApp if email absent but phone present
- **Channel priority**: Email first, then WhatsApp
- **Content**: Branded confirmation template with:
  - Guest greeting or partner-on-behalf greeting
  - Booking reference, experience, departure datetime, vessel, route
  - Total guests, total amount
  - Arrival instruction

### 6.3 WhatsApp Channel

- Activated when `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_FROM` are set
- Sends plain-text extraction of the HTML email body
- Phone normalization: supports Kenyan formats (`07xxxxxxxx`, `2547xxxxxxxx`, `+2547xxxxxxxx`)
- Does not replace email; runs in parallel when both contact methods exist

---

## 7. Pricing & Discounts

### 7.1 Partner Bookings
- Pricing calculated from selected origin stop to destination (Fort Jesus)
- No public discounts applied
- Reward engine awards points/cashback after booking creation
- `source: PARTNER`

### 7.2 Direct/Public Bookings
- Same base pricing engine
- Discounts applied automatically:
  - Couples: 10%
  - Group/family (4+ paying): 20%
  - Children 5–15: 50%
  - Under 5: free
- `source: DIRECT`
- Admin must confirm before departure

### 7.3 Admin Bookings
- Manual price override possible
- `source: ADMIN`

---

## 8. Availability Logic

### 8.1 Public Availability Strip (Marketing Page)

- Shows next 14 days
- Each day dot color:
  - Green: ≥ 6 seats available
  - Amber: 1–5 seats available
  - Red: 0 seats available
  - Gray: no departures scheduled
- Clicking a day scrolls to booking form or opens day panel

### 8.2 Admin/Partner Calendar Day View

- Calendar grid with trip/voyage/blocked modifiers
- Selected date shows:
  - Trip count, voyage count, booking count
  - Occupancy percentage
  - Departure cards with time, status, vessel, seat map
  - Booking rows with reference, passenger name, payment status
  - Blocked warning if applicable

### 8.3 Capacity Hard Limits

- Online bookings limited to 20 seats per departure
- Remaining 15 seats reserved for walk-ins (Setting Sons = 35 total)
- Hunky Dory online limit proportional (approx. 8 of 14 seats)
- Enforced in booking creation logic

---

## 9. Experience-Specific Behaviors

### 9.1 Fort Jesus (Water Taxi)
- Hop-on-hop-off: guests board at any stop along the route
- Fixed daily departure at 09:30
- Route has 9 stops; pricing is per-stop
- Return ticket option doubles the fare
- Vessel: Setting Sons, 35 seats

### 9.2 Creek Safaris
- Glass-bottom boat experience
- Fixed departure times
- Vessel: Hunky Dory, 14 seats

### 9.3 Sunset Sailing
- Evening departure
- Vessel: Hunky Dory, 14 seats

### 9.4 Snorkelling Reef
- Morning/midday departure
- Requires swimming ability
- Vessel: Hunky Dory, 14 seats

### 9.5 Birthdays & Anniversaries
- Private event
- Custom decorations, catering available
- Requires advance booking and 48h custom requests
- Vessel: Hunky Dory or Setting Sons depending on group size

---

## 10. Future Extensions

- Resource timeline view for operators (vessel lanes)
- Drag-create departures in admin calendar
- Recurring departure templates (e.g., daily 09:30 Fort Jesus)
- Waitlist when `availableCapacity` reaches 0
- SMS fallback when WhatsApp fails
- Dynamic pricing based on occupancy
- Multi-vessel assignment for large experiences
