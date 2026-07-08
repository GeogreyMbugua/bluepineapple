-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS voyage_captain_id VARCHAR(191);

-- CreateTable
CREATE TABLE "voyages" (
    "id" VARCHAR(191) NOT NULL,
    "voyageNumber" VARCHAR(191) NOT NULL,
    "departureId" VARCHAR(191) NOT NULL,
    "vesselId" VARCHAR(191) NOT NULL,
    "routeId" VARCHAR(191) NOT NULL,
    "status" VARCHAR(191) NOT NULL DEFAULT 'PLANNED',
    "scheduledDeparture" TIMESTAMP(3) NOT NULL,
    "actualDeparture" TIMESTAMP(3),
    "scheduledArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "captainId" VARCHAR(191),
    "operationalNotes" TEXT,
    "weatherSummary" TEXT,
    "cancellationReason" VARCHAR(191),
    "completionSummary" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voyages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crew_members" (
    "id" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) UNIQUE,
    "firstName" VARCHAR(191) NOT NULL,
    "lastName" VARCHAR(191) NOT NULL,
    "crewRole" VARCHAR(191) NOT NULL,
    "licenseNumber" VARCHAR(191),
    "certification" VARCHAR(191),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crew_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crew_assignments" (
    "id" VARCHAR(191) NOT NULL,
    "voyageId" VARCHAR(191) NOT NULL,
    "crewMemberId" VARCHAR(191) NOT NULL,
    "crewRole" VARCHAR(191) NOT NULL,
    "assignedBy" VARCHAR(191) NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "crew_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger_manifests" (
    "id" VARCHAR(191) NOT NULL,
    "voyageId" VARCHAR(191) NOT NULL,
    "bookingId" VARCHAR(191) NOT NULL,
    "guestId" VARCHAR(191) NOT NULL,
    "status" VARCHAR(191) NOT NULL DEFAULT 'RESERVED',
    "checkInId" VARCHAR(191) UNIQUE,
    "boardingId" VARCHAR(191) UNIQUE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "passenger_manifests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" VARCHAR(191) NOT NULL,
    "manifestId" VARCHAR(191) NOT NULL,
    "voyageId" VARCHAR(191) NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedById" VARCHAR(191) NOT NULL,
    "boardingGroup" VARCHAR(191),
    "notes" TEXT,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boardings" (
    "id" VARCHAR(191) NOT NULL,
    "manifestId" VARCHAR(191) NOT NULL,
    "voyageId" VARCHAR(191) NOT NULL,
    "boardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "boardedById" VARCHAR(191) NOT NULL,
    "status" VARCHAR(191) NOT NULL DEFAULT 'BOARDED',
    "notes" TEXT,

    CONSTRAINT "boardings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessel_readiness_checks" (
    "id" VARCHAR(191) NOT NULL,
    "voyageId" VARCHAR(191) NOT NULL,
    "checkType" VARCHAR(191) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" VARCHAR(191),
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "vessel_readiness_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_incidents" (
    "id" VARCHAR(191) NOT NULL,
    "voyageId" VARCHAR(191) NOT NULL,
    "type" VARCHAR(191) NOT NULL,
    "severity" VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
    "description" VARCHAR(2000) NOT NULL,
    "resolution" VARCHAR(2000),
    "recordedBy" VARCHAR(191) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "operational_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voyage_timelines" (
    "id" VARCHAR(191) NOT NULL,
    "voyageId" VARCHAR(191) NOT NULL,
    "eventType" VARCHAR(191) NOT NULL,
    "eventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" VARCHAR(191),
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "voyage_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voyages_voyageNumber_key" ON "voyages"("voyageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "voyages_departureId_key" ON "voyages"("departureId");

-- CreateIndex
CREATE INDEX "voyages_status_idx" ON "voyages"("status");

-- CreateIndex
CREATE INDEX "voyages_departureId_idx" ON "voyages"("departureId");

-- CreateIndex
CREATE INDEX "voyages_vesselId_idx" ON "voyages"("vesselId");

-- CreateIndex
CREATE INDEX "voyages_captainId_idx" ON "voyages"("captainId");

-- CreateIndex
CREATE INDEX "voyages_scheduledDeparture_idx" ON "voyages"("scheduledDeparture");

-- CreateIndex
CREATE INDEX "crew_members_crewRole_idx" ON "crew_members"("crewRole");

-- CreateIndex
CREATE INDEX "crew_members_isActive_idx" ON "crew_members"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "crew_assignments_voyageId_crewMemberId_key" ON "crew_assignments"("voyageId", "crewMemberId");

-- CreateIndex
CREATE INDEX "crew_assignments_voyageId_idx" ON "crew_assignments"("voyageId");

-- CreateIndex
CREATE INDEX "crew_assignments_crewMemberId_idx" ON "crew_assignments"("crewMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "passenger_manifests_voyageId_bookingId_key" ON "passenger_manifests"("voyageId", "bookingId");

-- CreateIndex
CREATE INDEX "passenger_manifests_voyageId_idx" ON "passenger_manifests"("voyageId");

-- CreateIndex
CREATE INDEX "passenger_manifests_bookingId_idx" ON "passenger_manifests"("bookingId");

-- CreateIndex
CREATE INDEX "passenger_manifests_guestId_idx" ON "passenger_manifests"("guestId");

-- CreateIndex
CREATE INDEX "passenger_manifests_status_idx" ON "passenger_manifests"("status");

-- CreateIndex
CREATE INDEX "check_ins_voyageId_idx" ON "check_ins"("voyageId");

-- CreateIndex
CREATE INDEX "check_ins_checkedInAt_idx" ON "check_ins"("checkedInAt");

-- CreateIndex
CREATE INDEX "boardings_voyageId_idx" ON "boardings"("voyageId");

-- CreateIndex
CREATE INDEX "boardings_boardedAt_idx" ON "boardings"("boardedAt");

-- CreateIndex
CREATE UNIQUE INDEX "vessel_readiness_checks_voyageId_checkType_key" ON "vessel_readiness_checks"("voyageId", "checkType");

-- CreateIndex
CREATE INDEX "vessel_readiness_checks_voyageId_idx" ON "vessel_readiness_checks"("voyageId");

-- CreateIndex
CREATE INDEX "operational_incidents_voyageId_idx" ON "operational_incidents"("voyageId");

-- CreateIndex
CREATE INDEX "operational_incidents_type_idx" ON "operational_incidents"("type");

-- CreateIndex
CREATE INDEX "operational_incidents_severity_idx" ON "operational_incidents"("severity");

-- CreateIndex
CREATE INDEX "voyage_timelines_voyageId_idx" ON "voyage_timelines"("voyageId");

-- CreateIndex
CREATE INDEX "voyage_timelines_eventType_idx" ON "voyage_timelines"("eventType");

-- CreateIndex
CREATE INDEX "voyage_timelines_eventAt_idx" ON "voyage_timelines"("eventAt");

-- AddForeignKey
ALTER TABLE "voyages" ADD CONSTRAINT "voyages_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "departures"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "voyages" ADD CONSTRAINT "voyages_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "vessels"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "voyages" ADD CONSTRAINT "voyages_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "voyages" ADD CONSTRAINT "voyages_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "users"("id") ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "crew_members" ADD CONSTRAINT "crew_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "crew_assignments" ADD CONSTRAINT "crew_assignments_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "voyages"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "crew_assignments" ADD CONSTRAINT "crew_assignments_crewMemberId_fkey" FOREIGN KEY ("crewMemberId") REFERENCES "crew_members"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "passenger_manifests" ADD CONSTRAINT "passenger_manifests_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "voyages"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_manifests" ADD CONSTRAINT "passenger_manifests_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "passenger_manifests" ADD CONSTRAINT "passenger_manifests_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "passenger_manifests" ADD CONSTRAINT "passenger_manifests_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "check_ins"("id") ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "passenger_manifests" ADD CONSTRAINT "passenger_manifests_boardingId_fkey" FOREIGN KEY ("boardingId") REFERENCES "boardings"("id") ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_manifestId_fkey" FOREIGN KEY ("manifestId") REFERENCES "passenger_manifests"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "voyages"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "users"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "boardings" ADD CONSTRAINT "boardings_manifestId_fkey" FOREIGN KEY ("manifestId") REFERENCES "passenger_manifests"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "boardings" ADD CONSTRAINT "boardings_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "voyages"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "boardings" ADD CONSTRAINT "boardings_boardedById_fkey" FOREIGN KEY ("boardedById") REFERENCES "users"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "vessel_readiness_checks" ADD CONSTRAINT "vessel_readiness_checks_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "voyages"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_incidents" ADD CONSTRAINT "operational_incidents_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "voyages"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "voyage_timelines" ADD CONSTRAINT "voyage_timelines_voyageId_fkey" FOREIGN KEY ("voyageId") REFERENCES "voyages"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "voyage_timelines" ADD CONSTRAINT "voyage_timelines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL;