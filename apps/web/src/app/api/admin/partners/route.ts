import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { partnerService, userService, currentUserService, roleManagementService } from '@blue-pineapple/iam';
import { z } from 'zod';

const CreatePartnerWithUserSchema = z.object({
  userId: z.string().uuid().optional(),
  partnerCode: z.string().min(2, 'Partner code must be at least 2 characters'),
  companyName: z.string().optional().nullable(),
  commissionRate: z.coerce.number().min(0).max(100),
  email: z.string().email('Invalid email address').optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
}).refine((data) => data.userId || data.email, {
  message: 'Either userId or email is required',
  path: ['userId'],
});

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  let partners;
  if (status) {
    partners = await partnerService.listByStatus(status);
  } else {
    partners = await partnerService.listByStatus('ACTIVE');
    const pending = await partnerService.listByStatus('PENDING');
    const suspended = await partnerService.listByStatus('SUSPENDED');
    const terminated = await partnerService.listByStatus('TERMINATED');
    partners = [...partners, ...pending, ...suspended, ...terminated];
  }

  const formatted = partners.map((p) => ({
    id: p.id,
    partnerCode: p.partnerCode,
    companyName: p.companyName,
    status: p.status,
    commissionRate: p.commissionRate,
    joinedAt: p.joinedAt,
    userId: p.userId,
  }));

  return Response.json({ data: { partners: formatted, total: formatted.length }, timestamp: new Date().toISOString() });
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  const admin = result;

  try {
    const body = await request.json();
    const validated = CreatePartnerWithUserSchema.parse(body);

    let userId = validated.userId;

    if (!userId && validated.email) {
      const existingUser = await currentUserService.getByEmail(validated.email);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const firstName = validated.firstName ?? validated.email.split('@')[0];
        const lastName = validated.lastName ?? 'Partner';
        userId = await userService.createUser({
          firstName: firstName || 'Partner',
          lastName: lastName || 'User',
          email: validated.email,
          phone: validated.phone || null,
        });
        await roleManagementService.assignRole(userId, 'PARTNER', admin.id);
      }
    }

    if (!userId) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message: 'userId or email is required' } },
        { status: 400 }
      );
    }

    const partnerId = await partnerService.createPartner({
      userId,
      partnerCode: validated.partnerCode,
      companyName: validated.companyName,
      commissionRate: validated.commissionRate,
    });

    if (!validated.userId && validated.email) {
      await roleManagementService.assignRole(userId, 'PARTNER', admin.id);
    }

    const partner = await partnerService.findById(partnerId);

    return Response.json({ data: partner, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      if (error.message.includes('already has a partner profile')) {
        return Response.json(
          { error: { code: 'CONFLICT', message: error.message } },
          { status: 409 }
        );
      }
      if (error.message.includes('Partner code')) {
        return Response.json(
          { error: { code: 'CONFLICT', message: error.message } },
          { status: 409 }
        );
      }
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create partner' } },
      { status: 500 }
    );
  }
}
