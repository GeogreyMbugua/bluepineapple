-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN "clerkUserId" TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS "users_clerkUserId_idx" ON "public"."users"("clerkUserId");
