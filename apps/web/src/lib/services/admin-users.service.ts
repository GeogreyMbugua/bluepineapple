import { userService } from '@blue-pineapple/iam';
import type { UserRow } from '@/components/admin/types';

export interface GetUsersOptions {
  includePartners?: boolean;
  includePendingVerification?: boolean;
  search?: string;
}

export async function getAdminUsers(options: GetUsersOptions = {}): Promise<UserRow[]> {
  try {
    const { includePartners = false, includePendingVerification = false, search = '' } = options;

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
        firstName: u.firstName ?? null,
        lastName: u.lastName ?? null,
        email: u.email ?? null,
        phone: u.phone ?? null,
        status: u.status,
        roles,
        lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : undefined,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        _search: `${fullName} ${email} ${phone}`,
      };
    });

    if (!includePendingVerification) {
      formatted = formatted.filter((u) => u.status !== 'PENDING_VERIFICATION');
    }

    if (search) {
      const searchLower = search.toLowerCase();
      formatted = formatted.filter((u) => u._search.includes(searchLower));
    }

    return formatted.map(({ _search, ...rest }) => rest);
  } catch (error) {
    console.error('[AdminUsersService] getAdminUsers error:', error);
    return [];
  }
}
