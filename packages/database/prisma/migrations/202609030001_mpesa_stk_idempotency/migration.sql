-- Harden M-Pesa STK idempotency and durable webhook ingest
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "externalReceipt" TEXT;

-- Unique CheckoutRequestID / receipt when present (Postgres allows multiple NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS "payments_provider_payment_id_key"
  ON "payments" ("providerPaymentId");

CREATE UNIQUE INDEX IF NOT EXISTS "payments_external_receipt_key"
  ON "payments" ("externalReceipt");

CREATE TABLE IF NOT EXISTS "payment_webhook_events" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "checkoutRequestId" TEXT,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_webhook_events_event_key_key"
  ON "payment_webhook_events" ("eventKey");

CREATE INDEX IF NOT EXISTS "payment_webhook_events_status_created_idx"
  ON "payment_webhook_events" ("status", "createdAt");

CREATE INDEX IF NOT EXISTS "payment_webhook_events_checkout_idx"
  ON "payment_webhook_events" ("checkoutRequestId");
