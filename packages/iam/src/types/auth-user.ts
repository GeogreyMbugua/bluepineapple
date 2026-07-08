import type { Role } from "./roles";
import type { Permission } from "./permissions";

/**
 * AuthUser — the lightweight user record available on authenticated requests.
 *
 * Previously used `string[]` for roles and permissions.
 * Now uses the canonical Role and Permission unions from @blue-pineapple/shared
 * to ensure type safety throughout the IAM pipeline.
 */
export interface AuthUser {
  id: string;
  email?: string | null;
  phone?: string | null;

  firstName?: string | null;
  lastName?: string | null;

  status: string;

  roles: Role[];
  permissions: Permission[];
}