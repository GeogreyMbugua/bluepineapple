import { currentUser } from '@clerk/nextjs/server';
import { userRepository } from '@blue-pineapple/database';
import type { Prisma } from '@blue-pineapple/database';

type DbUserWithRoles = NonNullable<Awaited<ReturnType<typeof userRepository.findByClerkUserId>>>;

/**
 * Resolve the Postgres user for an authenticated Clerk session.
 * Links pre-provisioned users by email when the webhook has not run yet
 * (common in local dev or immediately after first OTP sign-in).
 */
export async function resolveDbUserForClerk(
  clerkUserId: string,
): Promise<DbUserWithRoles | null> {
  const linked = await userRepository.findByClerkUserId(clerkUserId);
  if (linked) return linked;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find((entry) => entry.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) return null;

  const existing = await userRepository.findByEmail(email);
  if (!existing) return null;

  if (existing.clerkUserId && existing.clerkUserId !== clerkUserId) {
    console.warn(
      `[auth] Clerk user ${clerkUserId} email ${email} conflicts with linked clerkUserId ${existing.clerkUserId}`,
    );
    return null;
  }

  await userRepository.update(existing.id, {
    clerkUserId,
    firstName: clerkUser.firstName ?? existing.firstName,
    lastName: clerkUser.lastName ?? existing.lastName,
    emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
  } as Prisma.UserUpdateInput);

  return userRepository.findByClerkUserId(clerkUserId);
}
