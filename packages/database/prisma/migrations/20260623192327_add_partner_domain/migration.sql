-- CreateEnum
CREATE TYPE "public"."PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateTable
CREATE TABLE "public"."partner_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "companyName" TEXT,
    "commissionRate" DECIMAL(5,2) NOT NULL,
    "status" "public"."PartnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_payout_accounts" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT,
    "mpesaNumber" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_payout_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_status_history" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "oldStatus" "public"."PartnerStatus" NOT NULL,
    "newStatus" "public"."PartnerStatus" NOT NULL,
    "reason" TEXT,
    "changedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partner_profiles_userId_key" ON "public"."partner_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_profiles_partnerCode_key" ON "public"."partner_profiles"("partnerCode");

-- CreateIndex
CREATE INDEX "partner_profiles_status_idx" ON "public"."partner_profiles"("status");

-- CreateIndex
CREATE INDEX "partner_payout_accounts_partnerId_idx" ON "public"."partner_payout_accounts"("partnerId");

-- CreateIndex
CREATE INDEX "partner_status_history_partnerId_idx" ON "public"."partner_status_history"("partnerId");

-- AddForeignKey
ALTER TABLE "public"."partner_profiles" ADD CONSTRAINT "partner_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_payout_accounts" ADD CONSTRAINT "partner_payout_accounts_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_status_history" ADD CONSTRAINT "partner_status_history_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."partner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
