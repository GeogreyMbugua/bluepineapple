-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('ADMIN', 'PARTNER', 'INVESTOR', 'GUEST');

-- CreateEnum
CREATE TYPE "public"."OtpPurpose" AS ENUM ('LOGIN', 'BOOKING_CONFIRMATION', 'PAYMENT_CONFIRMATION', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userType" "public"."UserType" NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashedOtp" TEXT NOT NULL,
    "purpose" "public"."OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auth_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone");

-- CreateIndex
CREATE INDEX "users_userType_idx" ON "public"."users"("userType");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "public"."permissions"("key");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "public"."user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "public"."user_roles"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "public"."role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "public"."role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "public"."sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "public"."sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "public"."sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "otp_tokens_userId_idx" ON "public"."otp_tokens"("userId");

-- CreateIndex
CREATE INDEX "otp_tokens_purpose_idx" ON "public"."otp_tokens"("purpose");

-- CreateIndex
CREATE INDEX "otp_tokens_expiresAt_idx" ON "public"."otp_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "auth_logs_userId_idx" ON "public"."auth_logs"("userId");

-- CreateIndex
CREATE INDEX "auth_logs_event_idx" ON "public"."auth_logs"("event");

-- CreateIndex
CREATE INDEX "auth_logs_createdAt_idx" ON "public"."auth_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."otp_tokens" ADD CONSTRAINT "otp_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auth_logs" ADD CONSTRAINT "auth_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
