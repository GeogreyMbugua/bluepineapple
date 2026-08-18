# Plan: Partner Email Fallback for Booking Confirmation

## Problem
When a partner creates a booking on behalf of a guest without guest information (`guestId` is null), the confirmation email has no recipient because `BookingNotificationEngine` only checks `booking.guest?.email`.

## Goal
Send booking confirmation to the partner's user email when no guest email is available.

## Changes

### 1. Update `BookingNotificationEngine.handleBookingConfirmed`
**File:** `packages/iam/src/notifications/booking-notification-engine.ts`

Current logic:
```typescript
if (!booking?.guest?.email) return;
```

New logic:
```typescript
const recipientEmail = booking?.guest?.email || booking?.partner?.user?.email;
if (!recipientEmail) return;

const isPartnerRecipient = !booking?.guest?.email;
```

When `isPartnerRecipient` is true, use partner-facing template wording.

### 2. Ensure partner user email is available
`bookingRepository.findById()` includes `partner: true` but not `partner.user`. Two options:

**Recommended:** Add a targeted query in the engine using the database client.
- Import `prisma` from `@blue-pineapple/database/client`
- Query `prisma.partnerProfile.findFirst` with `user: { select: { email: true } }` when guest email is absent

**Alternative:** Update `BookingRepository.findById()` include to `partner: { include: { user: { select: { email: true } } } }`. Only choose this if other consumers also need the nested user data.

### 3. Update email template wording
**File:** `packages/iam/src/notifications/templates/booking-confirmation.template.ts`

Add a `recipientType?: "GUEST" | "PARTNER"` parameter:
- `GUEST`: "Hi {name}, your booking has been confirmed."
- `PARTNER`: "A booking has been confirmed on your behalf."

### 4. Validation
- Confirm a booking with `guestId = null` in local dev
- Verify email is sent to partner user email
- Confirm existing guest bookings still send to guest

## Open Questions
- Should partner bookings include guest details in the email (even if guest info is sparse)?
- Do we want to send partner notifications for other booking events (cancelled, completed)?
