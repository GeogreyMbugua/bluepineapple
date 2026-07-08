import type { AuthUser } from "../types/auth-user";
import type { Permission } from "../types/permissions";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "./has-permission";

export class PermissionService {
  /**
   * Checks if the user has the specified permission.
   */
  hasPermission(user: AuthUser, permission: Permission): boolean {
    return hasPermission(user, permission);
  }

  /**
   * Checks if the user has any of the specified permissions.
   */
  hasAnyPermission(user: AuthUser, permissions: readonly Permission[]): boolean {
    return hasAnyPermission(user, permissions);
  }

  /**
   * Checks if the user has all of the specified permissions.
   */
  hasAllPermissions(user: AuthUser, permissions: readonly Permission[]): boolean {
    return hasAllPermissions(user, permissions);
  }
}

export const permissionService = new PermissionService();
