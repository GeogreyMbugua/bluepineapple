import { NextRequest } from 'next/server';
import { requireAdminAuth } from '@/lib/api/admin-helpers';
import { userService } from '@blue-pineapple/iam';
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

    let users = await userService.list();

    if (!includePartners) {
      users = users.filter((u) => !(u as unknown as { partnerProfile?: unknown }).partnerProfile);
    }

    let formatted = users.map((u) => {
      const roles: string[] = [];
      const userWithRoles = u as unknown as { roles?: { role?: { name?: string } }[] };
      if (userWithRoles.roles) {
        for (const r of userWithRoles.roles) {
          if (r.role?.name) {
            roles.push(r.role.name);
          }
        }
      }
      const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      const phone = (u.phone ?? '').toLowerCase();

      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        status: u.status,
        roles,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        _search: `${fullName} ${email} ${phone}`,
      };
    });

    if (!includePendingVerification) {
      formatted = formatted.filter((u) => u.status !== 'PENDING_VERIFICATION');
    }

    if (search) {
      formatted = formatted.filter((u) => u._search.includes(search));
    }

    const result = formatted.map(({ _search, ...rest }) => rest);

    return Response.json({ data: { users: result, total: result.length }, timestamp: new Date().toISOString() });
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
    });

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
