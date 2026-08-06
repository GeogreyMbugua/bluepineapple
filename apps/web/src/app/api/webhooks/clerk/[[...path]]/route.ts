import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { userRepository, roleRepository, partnerRepository } from '@blue-pineapple/database';
import type { Prisma } from '@blue-pineapple/database';

async function generatePartnerCode(): Promise<string> {
  const prefix = 'P-';
  for (let i = 0; i < 5; i++) {
    const randomCode = prefix + Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await partnerRepository.findByPartnerCode(randomCode);
    if (!existing) return randomCode;
  }
  return prefix + Date.now().toString(36).toUpperCase();
}

async function ensurePartnerProfile(userId: string, name?: string) {
  const existing = await partnerRepository.findByUserId(userId);
  if (!existing) {
    const partnerCode = await generatePartnerCode();
    const companyName = name && name.trim() ? name.trim() : `Partner ${partnerCode}`;
    await partnerRepository.create({
      user: { connect: { id: userId } },
      partnerCode,
      companyName,
      commissionRate: 10,
      status: 'ACTIVE',
    });
  }
}

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
  const email = clerkUser.email_addresses?.find((e) => e.verification?.status === 'verified')?.email_address
    ?? clerkUser.email_addresses?.[0]?.email_address;
  const phone = clerkUser.phone_numbers?.find((p) => p.verification?.status === 'verified')?.phone_number
    ?? clerkUser.phone_numbers?.[0]?.phone_number;
  const isEmailVerified = clerkUser.email_addresses?.some((e) => e.verification?.status === 'verified');
  const isPhoneVerified = clerkUser.phone_numbers?.some((p) => p.verification?.status === 'verified');

  const existingByEmail = email ? await userRepository.findByEmail(email) : null;
  const existingByPhone = phone ? await userRepository.findByPhone(phone) : null;

  if (existingByEmail || existingByPhone) {
    const existing = existingByEmail ?? existingByPhone;
    if (existing && (!existing.clerkUserId || existing.clerkUserId === clerkUser.id)) {
      await userRepository.update(existing.id, {
        clerkUserId: clerkUser.id,
        emailVerifiedAt: isEmailVerified ? new Date() : existing.emailVerifiedAt,
        phoneVerifiedAt: isPhoneVerified ? new Date() : existing.phoneVerifiedAt,
      } as Prisma.UserUpdateInput);

      const fullName = `${clerkUser.first_name ?? ''} ${clerkUser.last_name ?? ''}`.trim();
      await ensurePartnerProfile(existing.id, fullName);
    }
    return;
  }

  const firstName = clerkUser.first_name ?? 'User';
  const lastName = clerkUser.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

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

  const partnerRole = await roleRepository.findByName('PARTNER');
  if (partnerRole) {
    await userRepository.assignRole(newUser.id, partnerRole.name);
  }

  await ensurePartnerProfile(newUser.id, fullName);
}

async function handleUserUpdated(clerkUser: ClerkUser) {
  let dbUser = await userRepository.findByClerkUserId(clerkUser.id);
  
  const email = clerkUser.email_addresses?.find((e) => e.verification?.status === 'verified')?.email_address
    ?? clerkUser.email_addresses?.[0]?.email_address;
  const phone = clerkUser.phone_numbers?.find((p) => p.verification?.status === 'verified')?.phone_number
    ?? clerkUser.phone_numbers?.[0]?.phone_number;
  const isEmailVerified = clerkUser.email_addresses?.some((e) => e.verification?.status === 'verified');
  const isPhoneVerified = clerkUser.phone_numbers?.some((p) => p.verification?.status === 'verified');

  if (!dbUser && email) {
    const existingByEmail = await userRepository.findByEmail(email);
    if (existingByEmail) {
      await userRepository.update(existingByEmail.id, {
        clerkUserId: clerkUser.id,
      } as Prisma.UserUpdateInput);
      dbUser = await userRepository.findByClerkUserId(clerkUser.id);
    }
  }

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

  const fullName = `${clerkUser.first_name ?? dbUser.firstName ?? ''} ${clerkUser.last_name ?? dbUser.lastName ?? ''}`.trim();
  await ensurePartnerProfile(dbUser.id, fullName);
}

async function handleUserDeleted(clerkUser: ClerkUser) {
  const dbUser = await userRepository.findByClerkUserId(clerkUser.id);
  if (dbUser) {
    await userRepository.update(dbUser.id, {
      status: 'SUSPENDED',
    } as Prisma.UserUpdateInput);
  }
}
