/*
  Warnings:

  - You are about to drop the column `userType` on the `users` table. All the data in the column will be lost.
  - Changed the type of `event` on the `auth_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."AuthEvent" AS ENUM ('LOGIN_REQUESTED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'OTP_SENT', 'OTP_VERIFIED', 'SESSION_CREATED', 'SESSION_REVOKED', 'LOGOUT');

-- DropIndex
DROP INDEX "public"."users_userType_idx";

-- AlterTable
ALTER TABLE "public"."auth_logs" DROP COLUMN "event",
ADD COLUMN     "event" "public"."AuthEvent" NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "userType";

-- DropEnum
DROP TYPE "public"."UserType";

-- CreateIndex
CREATE INDEX "auth_logs_event_idx" ON "public"."auth_logs"("event");

-- CreateIndex
CREATE INDEX "partner_status_history_changedByUserId_idx" ON "public"."partner_status_history"("changedByUserId");

-- AddForeignKey
ALTER TABLE "public"."partner_status_history" ADD CONSTRAINT "partner_status_history_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
