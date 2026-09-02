import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/nextjs/server';
import { userRepository } from '@blue-pineapple/database';
import type { Prisma } from '@blue-pineapple/database';
import {
  ensurePartnerProfile,
  ensurePartnerRole,
  isAdminRoleSet,
} from '@/lib/auth/partner-provisioning';

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

type ClerkEmailAddress = {
  email_address: string;
  verification?: { status: string };
};

type ClerkPhoneNumber = {
  phone_number: string;
  verification?: { status: string };
};

type ClerkUser = {
  id: string;
  email_addresses: ClerkEmailAddress[];
  phone_numbers: ClerkPhoneNumber[];
  first_name: string | null;
  last_name: string | null;
  unsafe_metadata?: {
    signupPortal?: string;
  };
};

type ClerkWebhookEvent = {
  type: string;
  data: ClerkUser;
};

export async function POST(request: NextRequest) {
  if (!CLERK_WEBHOOK_SECRET) {
    console.error('[clerk-webhook] CLERK_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Read raw body as text for signature verification
  const rawBody = await request.text();

  // Correct Svix header names (svix-id / svix-signature / svix-timestamp)
  const svixHeaders = {
    'svix-id': request.headers.get('svix-id') ?? '',
    'svix-signature': request.headers.get('svix-signature') ?? '',
    'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
  };

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(rawBody, svixHeaders) as ClerkWebhookEvent;
  } catch (err) {
    console.error('[clerk-webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const eventType = event.type;
  const clerkUser = event.data;

  console.log(`[clerk-webhook] Processing event: ${eventType} for clerkId=${clerkUser.id}`);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(clerkUser);
        break;
      case 'user.updated':
        await handleUserUpdated(clerkUser);
        break;
      case 'user.deleted':
        await handleUserDeleted(clerkUser);
        break;
      default:
        console.log(`[clerk-webhook] Ignoring unhandled event type: ${eventType}`);
        return NextResponse.json({ message: `Event ${eventType} ignored` }, { status: 200 });
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch (err) {
    console.error(`[clerk-webhook] Error processing ${eventType}:`, err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractEmailAndPhone(clerkUser: ClerkUser) {
  const email =
    clerkUser.email_addresses?.find((e) => e.verification?.status === 'verified')?.email_address ??
    clerkUser.email_addresses?.[0]?.email_address;
  const phone =
    clerkUser.phone_numbers?.find((p) => p.verification?.status === 'verified')?.phone_number ??
    clerkUser.phone_numbers?.[0]?.phone_number;
  const isEmailVerified = clerkUser.email_addresses?.some(
    (e) => e.verification?.status === 'verified',
  );
  const isPhoneVerified = clerkUser.phone_numbers?.some(
    (p) => p.verification?.status === 'verified',
  );
  return { email, phone, isEmailVerified, isPhoneVerified };
}

async function syncClerkRoles(clerkUserId: string, roleNames: string[]): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUser(clerkUserId, {
      publicMetadata: { roles: roleNames },
    });
    console.log(`[clerk-webhook] Synced roles to Clerk metadata for ${clerkUserId}: ${roleNames.join(', ')}`);
  } catch (err) {
    console.error(`[clerk-webhook] Failed to sync roles to Clerk for ${clerkUserId}:`, err);
  }
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

async function handleUserCreated(clerkUser: ClerkUser) {
  const { email, phone, isEmailVerified, isPhoneVerified } = extractEmailAndPhone(clerkUser);

  const firstName = clerkUser.first_name ?? 'User';
  const lastName = clerkUser.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  // Check if a DB user already exists (e.g. pre-seeded admin or prior OTP user)
  const existingByEmail = email ? await userRepository.findByEmail(email) : null;
  const existingByPhone = phone ? await userRepository.findByPhone(phone) : null;

  if (existingByEmail || existingByPhone) {
    const existing = existingByEmail ?? existingByPhone!;

    // Only link if not already linked to a different Clerk account
    if (!existing.clerkUserId || existing.clerkUserId === clerkUser.id) {
      await userRepository.update(existing.id, {
        clerkUserId: clerkUser.id,
        emailVerifiedAt: isEmailVerified ? new Date() : existing.emailVerifiedAt,
        phoneVerifiedAt: isPhoneVerified ? new Date() : existing.phoneVerifiedAt,
      } as Prisma.UserUpdateInput);

      // findByEmail/findByPhone return plain User (no roles join).
      // Re-query with the now-linked clerkUserId to get the full roles relation.
      const linkedUser = await userRepository.findByClerkUserId(clerkUser.id);
      const existingRoleNames = linkedUser?.roles.map((ur) => ur.role.name) ?? [];

      // ⛔ Never provision partner resources for admin accounts
      if (isAdminRoleSet(existingRoleNames)) {
        console.log(
          `[clerk-webhook] Skipping partner provisioning for admin user ${existing.id}`,
        );
        await syncClerkRoles(clerkUser.id, existingRoleNames);
        return;
      }

      await ensurePartnerRole(existing.id);
      await ensurePartnerProfile(existing.id, fullName);

      const finalRoles = await userRepository.findByClerkUserId(clerkUser.id);
      const finalRoleNames = finalRoles?.roles.map((ur) => ur.role.name) ?? [];
      await syncClerkRoles(clerkUser.id, finalRoleNames);
    } else {
      console.warn(
        `[clerk-webhook] User ${existing.id} already linked to a different Clerk account. Skipping.`,
      );
    }
    return;
  }

  // Brand-new user — create DB record; partner provisioning only for explicit partner signups
  const newUser = await userRepository.create({
    email: email ?? undefined,
    phone: phone ?? undefined,
    firstName,
    lastName,
    status: 'ACTIVE',
    clerkUserId: clerkUser.id,
    emailVerifiedAt: isEmailVerified ? new Date() : undefined,
    phoneVerifiedAt: isPhoneVerified ? new Date() : undefined,
  } as Prisma.UserCreateInput);

  const signupPortal = clerkUser.unsafe_metadata?.signupPortal;
  if (signupPortal === 'partner') {
    await ensurePartnerRole(newUser.id);
    await ensurePartnerProfile(newUser.id, fullName);
    await syncClerkRoles(clerkUser.id, ['PARTNER']);
    console.log(`[clerk-webhook] Created new PARTNER user ${newUser.id} for clerkId=${clerkUser.id}`);
    return;
  }

  await syncClerkRoles(clerkUser.id, []);
  console.log(`[clerk-webhook] Created new user ${newUser.id} for clerkId=${clerkUser.id} (no roles assigned)`);
}

async function handleUserUpdated(clerkUser: ClerkUser) {
  const { email, phone, isEmailVerified, isPhoneVerified } = extractEmailAndPhone(clerkUser);

  let dbUser = await userRepository.findByClerkUserId(clerkUser.id);

  // If not found by clerkUserId, try to link by email
  if (!dbUser && email) {
    const existingByEmail = await userRepository.findByEmail(email);
    if (existingByEmail) {
      await userRepository.update(existingByEmail.id, {
        clerkUserId: clerkUser.id,
      } as Prisma.UserUpdateInput);
      dbUser = await userRepository.findByClerkUserId(clerkUser.id);
    }
  }

  // Still no record — treat as a new user creation
  if (!dbUser) {
    await handleUserCreated(clerkUser);
    return;
  }

  await userRepository.update(dbUser.id, {
    email: email ?? dbUser.email,
    phone: phone ?? dbUser.phone,
    firstName: clerkUser.first_name ?? dbUser.firstName,
    lastName: clerkUser.last_name ?? dbUser.lastName,
    emailVerifiedAt: isEmailVerified ? new Date() : dbUser.emailVerifiedAt,
    phoneVerifiedAt: isPhoneVerified ? new Date() : dbUser.phoneVerifiedAt,
  } as Prisma.UserUpdateInput);

  // Keep partner profile name in sync — only for non-admin users
  const roleNames = dbUser.roles?.map((r) => r.role.name) ?? [];
  if (!isAdminRoleSet(roleNames)) {
    const fullName =
      `${clerkUser.first_name ?? dbUser.firstName ?? ''} ${clerkUser.last_name ?? dbUser.lastName ?? ''}`.trim();
    await ensurePartnerProfile(dbUser.id, fullName);
  }

  const updatedRoles = await userRepository.findByClerkUserId(clerkUser.id);
  const updatedRoleNames = updatedRoles?.roles.map((ur) => ur.role.name) ?? [];
  await syncClerkRoles(clerkUser.id, updatedRoleNames);
}

async function handleUserDeleted(clerkUser: ClerkUser) {
  const dbUser = await userRepository.findByClerkUserId(clerkUser.id);
  if (dbUser) {
    await userRepository.update(dbUser.id, {
      status: 'SUSPENDED',
    } as Prisma.UserUpdateInput);
    console.log(`[clerk-webhook] Suspended user ${dbUser.id} for clerkId=${clerkUser.id}`);
  }
}
