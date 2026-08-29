ALTER TABLE "public"."bookings"
  ADD COLUMN "originStopId" TEXT,
  ADD COLUMN "destinationStopId" TEXT,
  ADD COLUMN "adults" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "children" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "infants" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "returnTicket" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "segments" INTEGER,
  ADD COLUMN "pricingMode" TEXT NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN "discountRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
  ADD COLUMN "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE "public"."bookings"
  ADD CONSTRAINT "bookings_originStopId_fkey"
    FOREIGN KEY ("originStopId") REFERENCES "public"."route_stops"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "bookings_destinationStopId_fkey"
    FOREIGN KEY ("destinationStopId") REFERENCES "public"."route_stops"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "bookings_originStopId_idx" ON "public"."bookings"("originStopId");
CREATE INDEX "bookings_destinationStopId_idx" ON "public"."bookings"("destinationStopId");
