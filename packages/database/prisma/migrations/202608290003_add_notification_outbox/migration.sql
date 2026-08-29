CREATE TABLE "public"."notification_outbox" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_outbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_outbox_bookingId_purpose_key"
  ON "public"."notification_outbox"("bookingId", "purpose");
CREATE INDEX "notification_outbox_status_createdAt_idx"
  ON "public"."notification_outbox"("status", "createdAt");

ALTER TABLE "public"."notification_outbox"
  ADD CONSTRAINT "notification_outbox_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
