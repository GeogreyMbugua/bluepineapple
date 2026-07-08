import type { AuthUser } from "../types/auth-user";
import type { Permission } from "../types/permissions";

/**
 * Returns true if the user has been granted the given permission.
 *
 * NOTE: At runtime, the AuthUser.permissions array must already be the
 * fully-resolved concrete list. Wildcard expansion (SUPER_ADMIN "*") happens
 * at session-build time, not here. This function performs a direct membership
 * check — no wildcard logic.
 *
 * @example
 * if (!hasPermission(user, "partner.create")) throw new ForbiddenError();
 */
export function hasPermission(
  user: AuthUser,
  permission: Permission,
): boolean {
  return user.permissions.includes(permission);
}

/**
 * Returns true if the user has at least one of the given permissions.
 *
 * @example
 * if (!hasAnyPermission(user, ["booking.read", "booking.manage"])) {
 *   throw new ForbiddenError();
 * }
 */
export function hasAnyPermission(
  user: AuthUser,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((perm) => user.permissions.includes(perm));
}

/**
 * Returns true if the user has every one of the given permissions.
 *
 * @example
 * if (!hasAllPermissions(user, ["payment.read", "payment.manage"])) {
 *   throw new ForbiddenError();
 * }
 */
export function hasAllPermissions(
  user: AuthUser,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((perm) => user.permissions.includes(perm));
}
