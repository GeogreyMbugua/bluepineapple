-- Phase 2: Add all domain models for Fleet, Experience, Route, Departure, Booking, Reward, Guest
-- This is an additive migration. No destructive changes.

--
-- ENUMS
--

CREATE TYPE "public"."ExperienceCategory" AS ENUM ('TRANSPORT', 'LEISURE', 'ADVENTURE', 'PRIVATE', 'CORPORATE');

CREATE TYPE "public"."VesselStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DECOMMISSIONED');

CREATE TYPE "public"."VesselType" AS ENUM ('FERRY', 'SPEEDBOAT', 'DHOW', 'CATAMARAN', 'CATAMARAN_LUXURY');

CREATE TYPE "public"."DepartureStatus" AS ENUM ('SCHEDULED', 'BOARDING', 'DEPARTED', 'COMPLETED', 'CANCELLED');

CREATE TYPE "public"."BookingSource" AS ENUM ('PARTNER', 'DIRECT', 'ADMIN', 'HOTEL', 'CORPORATE');

CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED');

CREATE TYPE "public"."RewardStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID_OUT', 'EXPIRED', 'REVERSED');

--
-- EXPERIENCES
--

CREATE TABLE "public"."experiences" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "durationMinutes" INTEGER,
    "defaultPrice" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "category" "ExperienceCategory" NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "heroImageUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maxGroupSize" INTEGER,
    "minGroupSize" INTEGER,
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "includes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "experiences_slug_key" ON "public"."experiences"("slug");
CREATE INDEX "experiences_category_idx" ON "public"."experiences"("category");
CREATE INDEX "experiences_isActive_idx" ON "public"."experiences"("isActive");
CREATE INDEX "experiences_isFeatured_idx" ON "public"."experiences"("isFeatured");

--
-- EXPERIENCE ROUTES (many-to-many)
--

CREATE TABLE "public"."experience_routes" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "experience_routes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "experience_routes_experienceId_routeId_key" ON "public"."experience_routes"("experienceId","routeId");
CREATE INDEX "experience_routes_experienceId_idx" ON "public"."experience_routes"("experienceId");
CREATE INDEX "experience_routes_routeId_idx" ON "public"."experience_routes"("routeId");

--
-- ROUTES
--

CREATE TABLE "public"."routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "estimatedDurationMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "routes_code_key" ON "public"."routes"("code");
CREATE INDEX "routes_isActive_idx" ON "public"."routes"("isActive");

--
-- ROUTE STOPS
--

CREATE TABLE "public"."route_stops" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "sequence" INTEGER NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "isPickupPoint" BOOLEAN NOT NULL DEFAULT true,
    "isDropoffPoint" BOOLEAN NOT NULL DEFAULT true,
    "estimatedArrivalMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "route_stops_routeId_sequence_key" ON "public"."route_stops"("routeId","sequence");
CREATE UNIQUE INDEX "route_stops_routeId_code_key" ON "public"."route_stops"("routeId","code");
CREATE INDEX "route_stops_routeId_idx" ON "public"."route_stops"("routeId");

--
-- FLEET
--

CREATE TABLE "public"."vessels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration" TEXT,
    "capacity" INTEGER NOT NULL,
    "status" "VesselStatus" NOT NULL DEFAULT 'ACTIVE',
    "type" "VesselType",
    "operatorName" TEXT,
    "ownerName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vessels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vessels_name_key" ON "public"."vessels"("name");
CREATE UNIQUE INDEX "vessels_registration_key" ON "public"."vessels"("registration");
CREATE INDEX "vessels_status_idx" ON "public"."vessels"("status");

CREATE TABLE "public"."vessel_maintenance_logs" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vessel_maintenance_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vessel_maintenance_logs_vesselId_idx" ON "public"."vessel_maintenance_logs"("vesselId");
CREATE INDEX "vessel_maintenance_logs_performedAt_idx" ON "public"."vessel_maintenance_logs"("performedAt");

--
-- DEPARTURES
--

CREATE TABLE "public"."departures" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "departureDateTime" TIMESTAMP(3) NOT NULL,
    "arrivalDateTime" TIMESTAMP(3),
    "totalCapacity" INTEGER NOT NULL,
    "bookedSeats" INTEGER NOT NULL DEFAULT 0,
    "availableCapacity" INTEGER NOT NULL,
    "status" "DepartureStatus" NOT NULL DEFAULT 'SCHEDULED',
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "departures_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "departures_vesselId_idx" ON "public"."departures"("vesselId");
CREATE INDEX "departures_routeId_idx" ON "public"."departures"("routeId");
CREATE INDEX "departures_experienceId_idx" ON "public"."departures"("experienceId");
CREATE INDEX "departures_departureDateTime_idx" ON "public"."departures"("departureDateTime");
CREATE INDEX "departures_status_idx" ON "public"."departures"("status");

--
-- GUESTS
--

CREATE TABLE "public"."guests" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "idNumber" TEXT,
    "nationality" TEXT,
    "country" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "specialRequests" TEXT,
    "notes" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "totalVisits" INTEGER NOT NULL DEFAULT 0,
    "firstVisitAt" TIMESTAMP(3),
    "lastVisitAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "guests_email_idx" ON "public"."guests"("email");
CREATE INDEX "guests_phone_idx" ON "public"."guests"("phone");
CREATE INDEX "guests_lastVisitAt_idx" ON "public"."guests"("lastVisitAt");

--
-- BOOKINGS
--

CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "departureId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "guestId" TEXT,
    "totalGuests" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "source" "BookingSource" NOT NULL DEFAULT 'PARTNER',
    "pickupStopId" TEXT,
    "specialRequests" TEXT,
    "notes" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "rewardEligible" BOOLEAN NOT NULL DEFAULT true,
    "rewardProcessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bookings_bookingReference_key" ON "public"."bookings"("bookingReference");
CREATE INDEX "bookings_departureId_idx" ON "public"."bookings"("departureId");
CREATE INDEX "bookings_partnerId_idx" ON "public"."bookings"("partnerId");
CREATE INDEX "bookings_guestId_idx" ON "public"."bookings"("guestId");
CREATE INDEX "bookings_status_idx" ON "public"."bookings"("status");
CREATE INDEX "bookings_createdAt_idx" ON "public"."bookings"("createdAt");

--
-- BOOKING GUESTS
--

CREATE TABLE "public"."booking_guests" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "idNumber" TEXT,
    "phoneNumber" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "booking_guests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "booking_guests_bookingId_idx" ON "public"."booking_guests"("bookingId");

--
-- BOOKING STATUS HISTORY
--

CREATE TABLE "public"."booking_status_history" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "oldStatus" "BookingStatus",
    "newStatus" "BookingStatus" NOT NULL,
    "reason" TEXT,
    "changedByUserId" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "booking_status_history_bookingId_idx" ON "public"."booking_status_history"("bookingId");
CREATE INDEX "booking_status_history_changedAt_idx" ON "public"."booking_status_history"("changedAt");

--
-- REWARDS
--

CREATE TABLE "public"."reward_transactions" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "pointsEarned" INTEGER NOT NULL,
    "cashValue" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "reward_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reward_transactions_bookingId_key" ON "public"."reward_transactions"("bookingId");
CREATE INDEX "reward_transactions_partnerId_idx" ON "public"."reward_transactions"("partnerId");
CREATE INDEX "reward_transactions_ruleId_idx" ON "public"."reward_transactions"("ruleId");
CREATE INDEX "reward_transactions_status_idx" ON "public"."reward_transactions"("status");
CREATE INDEX "reward_transactions_createdAt_idx" ON "public"."reward_transactions"("createdAt");

CREATE TABLE "public"."reward_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "pointsPerBooking" INTEGER NOT NULL,
    "cashMultiplier" DECIMAL(5,4),
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "minGuests" INTEGER NOT NULL DEFAULT 1,
    "maxGuests" INTEGER,
    "experienceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "routeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reward_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reward_rules_name_key" ON "public"."reward_rules"("name");
CREATE INDEX "reward_rules_isActive_idx" ON "public"."reward_rules"("isActive");
CREATE INDEX "reward_rules_effectiveFrom_effectiveTo_idx" ON "public"."reward_rules"("effectiveFrom","effectiveTo");

--
-- FOREIGN KEYS
--

ALTER TABLE "public"."experience_routes" ADD CONSTRAINT "experience_routes_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "public"."experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."experience_routes" ADD CONSTRAINT "experience_routes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."route_stops" ADD CONSTRAINT "route_stops_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."vessel_maintenance_logs" ADD CONSTRAINT "vessel_maintenance_logs_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "public"."vessels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."departures" ADD CONSTRAINT "departures_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "public"."vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."departures" ADD CONSTRAINT "departures_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."departures" ADD CONSTRAINT "departures_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "public"."experiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "public"."departures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_pickupStopId_fkey" FOREIGN KEY ("pickupStopId") REFERENCES "public"."route_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."booking_guests" ADD CONSTRAINT "booking_guests_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."booking_status_history" ADD CONSTRAINT "booking_status_history_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."booking_status_history" ADD CONSTRAINT "booking_status_history_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."reward_transactions" ADD CONSTRAINT "reward_transactions_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."reward_transactions" ADD CONSTRAINT "reward_transactions_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."partner_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."reward_transactions" ADD CONSTRAINT "reward_transactions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."reward_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
