-- Add a separate online quota without changing the vessel's physical capacity.
ALTER TABLE "public"."departures"
  ADD COLUMN "onlineCapacity" INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN "onlineBookedSeats" INTEGER NOT NULL DEFAULT 0;

-- Existing partner bookings were the only bookings previously treated as online.
UPDATE "public"."departures" AS d
SET "onlineBookedSeats" = COALESCE((
  SELECT SUM(b."totalGuests")
  FROM "public"."bookings" AS b
  WHERE b."departureId" = d."id"
    AND b."status" <> 'CANCELLED'
    AND b."source" IN ('DIRECT', 'PARTNER')
), 0);

UPDATE "public"."departures" AS d
SET "bookedSeats" = COALESCE((
    SELECT SUM(b."totalGuests")
    FROM "public"."bookings" AS b
    WHERE b."departureId" = d."id"
      AND b."status" IN ('PENDING', 'CONFIRMED')
  ), 0),
  "availableCapacity" = d."totalCapacity" - COALESCE((
    SELECT SUM(b."totalGuests")
    FROM "public"."bookings" AS b
    WHERE b."departureId" = d."id"
      AND b."status" IN ('PENDING', 'CONFIRMED')
  ), 0);
