import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { getAdminUsers } from '@/lib/admin/users';
import { userService } from '@blue-pineapple/iam';
import { roleManagementService } from '@blue-pineapple/iam';
import { CreateUserSchema } from '@blue-pineapple/iam';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const { searchParams } = new URL(request.url);
    const includePartners = searchParams.get('includePartners') === 'true';
    const includePendingVerification = searchParams.get('includePendingVerification') === 'true';
    const search = searchParams.get('search')?.toLowerCase() || '';

    const users = await getAdminUsers({
      includePartners,
      includePendingVerification,
      search,
    });

    return Response.json({ data: { users, total: users.length }, timestamp: new Date().toISOString() });
  } catch {
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch users' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const result = await requireAdminAuth(request);
  if (result instanceof Response) return result;

  try {
    const body = await request.json();
    const validated = CreateUserSchema.parse(body);

    const userId = await userService.createUser({
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone,
      clerkUserId: validated.clerkUserId,
    });

    if (validated.role) {
      await roleManagementService.assignRole(userId, validated.role, result.id);
    }

    return Response.json({ data: { id: userId }, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create user' } },
      { status: 500 }
    );
  }
}
