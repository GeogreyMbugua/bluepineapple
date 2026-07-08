import type { AuthUser } from "../types/auth-user";
import type { Role } from "../types/roles";
import { hasRole, hasAnyRole, hasAllRoles, isSuperAdmin } from "./has-role";

export class RoleService {
  /**
   * Checks if the user has the specified role.
   */
  hasRole(user: AuthUser, role: Role): boolean {
    return hasRole(user, role);
  }

  /**
   * Checks if the user has any of the specified roles.
   */
  hasAnyRole(user: AuthUser, roles: readonly Role[]): boolean {
    return hasAnyRole(user, roles);
  }

  /**
   * Checks if the user has all of the specified roles.
   */
  hasAllRoles(user: AuthUser, roles: readonly Role[]): boolean {
    return hasAllRoles(user, roles);
  }

  /**
   * Checks if the user is a super admin.
   */
  isSuperAdmin(user: AuthUser): boolean {
    return isSuperAdmin(user);
  }
}

export const roleService = new RoleService();
