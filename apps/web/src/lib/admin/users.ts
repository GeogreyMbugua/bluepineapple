import { userService } from '@blue-pineapple/iam';
import type { UserRow } from '@/components/admin/types';

export interface AdminUsersListParams {
  includePartners?: boolean;
  includePendingVerification?: boolean;
  search?: string;
}

function toIsoString(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

export async function getAdminUsers(params: AdminUsersListParams = {}): Promise<UserRow[]> {
  const {
    includePartners = false,
    includePendingVerification = false,
    search = '',
  } = params;

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
      lastLoginAt: toIsoString(u.lastLoginAt),
      createdAt: toIsoString(u.createdAt) ?? new Date().toISOString(),
      _search: `${fullName} ${email} ${phone}`,
    };
  });

  if (!includePendingVerification) {
    formatted = formatted.filter((u) => u.status !== 'PENDING_VERIFICATION');
  }

  const normalizedSearch = search.toLowerCase();
  if (normalizedSearch) {
    formatted = formatted.filter((u) => u._search.includes(normalizedSearch));
  }

  return formatted.map(({ _search, ...rest }) => rest);
}
