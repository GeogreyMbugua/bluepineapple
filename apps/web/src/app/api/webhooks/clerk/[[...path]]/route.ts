import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { userRepository } from '@blue-pineapple/database';
import { roleRepository } from '@blue-pineapple/database';
import type { Prisma } from '@prisma/client';

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
};

type ClerkWebhookEvent = {
  type: string;
  data: ClerkUser;
};

export async function POST(request: NextRequest) {
  if (!CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const payload = await request.json();
  const svixHeaders = {
    'svix-t-id': request.headers.get('svix-t-id') ?? '',
    'svix-t-signature': request.headers.get('svix-t-signature') ?? '',
    'svix-t-timestamp': request.headers.get('svix-t-timestamp') ?? '',
  };

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(JSON.stringify(payload), svixHeaders) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const eventType = event.type;
  const clerkUser = event.data;

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
        return NextResponse.json({ message: `Event ${eventType} ignored` }, { status: 200 });
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleUserCreated(clerkUser: ClerkUser) {
  const email = clerkUser.email_addresses?.find((e) => e.verification?.status === 'verified')?.email_address;
  const phone = clerkUser.phone_numbers?.find((p) => p.verification?.status === 'verified')?.phone_number;

  const existingByEmail = email ? await userRepository.findByEmail(email) : null;
  const existingByPhone = phone ? await userRepository.findByPhone(phone) : null;

  if (existingByEmail || existingByPhone) {
    const existing = existingByEmail ?? existingByPhone;
    if (existing && !existing.clerkUserId) {
      await userRepository.update(existing.id, {
        clerkUserId: clerkUser.id,
        emailVerifiedAt: email ? new Date() : undefined,
        phoneVerifiedAt: phone ? new Date() : undefined,
      } as Prisma.UserUpdateInput);
    } else if (existing && existing.clerkUserId === clerkUser.id) {
      await userRepository.update(existing.id, {
        emailVerifiedAt: email ? new Date() : undefined,
        phoneVerifiedAt: phone ? new Date() : undefined,
      } as Prisma.UserUpdateInput);
    }
    return;
  }

  const firstName = clerkUser.first_name ?? 'User';
  const lastName = clerkUser.last_name ?? '';

  const newUser = await userRepository.create({
    email: email ?? undefined,
    phone: phone ?? undefined,
    firstName,
    lastName,
    status: 'ACTIVE',
    clerkUserId: clerkUser.id,
    emailVerifiedAt: email ? new Date() : undefined,
    phoneVerifiedAt: phone ? new Date() : undefined,
  } as Prisma.UserCreateInput);

  const partnerRole = await roleRepository.findByName('PARTNER');
  if (partnerRole) {
    await userRepository.assignRole(newUser.id, partnerRole.name);
  }
}

async function handleUserUpdated(clerkUser: ClerkUser) {
  const dbUser = await userRepository.findByClerkUserId(clerkUser.id);
  if (!dbUser) {
    await handleUserCreated(clerkUser);
    return;
  }

  const email = clerkUser.email_addresses?.find((e) => e.verification?.status === 'verified')?.email_address;
  const phone = clerkUser.phone_numbers?.find((p) => p.verification?.status === 'verified')?.phone_number;

  await userRepository.update(dbUser.id, {
    email: email ?? dbUser.email,
    phone: phone ?? dbUser.phone,
    firstName: clerkUser.first_name ?? dbUser.firstName,
    lastName: clerkUser.last_name ?? dbUser.lastName,
    emailVerifiedAt: email ? new Date() : dbUser.emailVerifiedAt,
    phoneVerifiedAt: phone ? new Date() : dbUser.phoneVerifiedAt,
  } as Prisma.UserUpdateInput);
}

async function handleUserDeleted(clerkUser: ClerkUser) {
  const dbUser = await userRepository.findByClerkUserId(clerkUser.id);
  if (dbUser) {
    await userRepository.update(dbUser.id, {
      status: 'SUSPENDED',
    } as Prisma.UserUpdateInput);
  }
}
